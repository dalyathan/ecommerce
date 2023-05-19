import { ConfigService, Injector, InternalServerError, Logger, OperationEntity, TransactionalConnection } from '@etech/core';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLRequestContext } from 'apollo-server-types';
import {
    getNamedType,
    getNullableType,
    GraphQLSchema,
    isListType,
    isObjectType,
    separateOperations,
} from 'graphql';
import {getRepository} from 'typeorm';
import { ComplexityEstimatorArgs, getComplexity, simpleEstimator } from 'graphql-query-complexity';

import { loggerCtx } from '../constants';
import { HardenPluginOptions } from '../types';
import { default as dayjs } from 'dayjs';
/**
 * @description
 * Implements query complexity analysis on Shop API requests.
 */
export class QueryComplexityPlugin implements ApolloServerPlugin {
    constructor(private options: HardenPluginOptions) {
    }

    requestDidStart(gqlRequestContext: GraphQLRequestContext): GraphQLRequestListener {
        const maxQueryComplexity = this.options.maxQueryComplexity ?? 1000;
        const requestStartTime= dayjs(new Date());
        return {
            willSendResponse: async (requestContext) => {
                const requestEndTime= dayjs(new Date());
                const query = requestContext.request.operationName
                    ? separateOperations(requestContext.document)[requestContext.request.operationName]
                    : requestContext.document;
                if (!this.options.logComplexityScore) {
                    return;
                }
                const complexity = getComplexity({
                    schema:gqlRequestContext.schema,
                    query,
                    variables: requestContext.request.variables,
                    estimators: this.options.queryComplexityEstimators ?? [
                        defaultVendureComplexityEstimator(
                            this.options.customComplexityFactors ?? {},
                            this.options.logComplexityScore ?? false,
                        ),
                        simpleEstimator({ defaultComplexity: 1 }),
                    ],
                });
                // console.log((requestContext.context['req'].headers['referer'] as string).split(requestContext.context['req'].headers['origin'] as string)[1]);
                // console.log(requestContext.context['res'].headers);
                if (this.options.logComplexityScore === true) {
                    const operationLog= new OperationEntity();
                    operationLog.apiType= isAdminApi(gqlRequestContext.schema)?'admin':'shop';
                    operationLog.complexity= complexity.toString();
                    operationLog.ip= gqlRequestContext.context['req'].headers['x-forwarded-for'] ||
                    gqlRequestContext.context['req'].socket.remoteAddress ||
                    '';
                    operationLog.operation= requestContext.operation?.operation;
                    operationLog.operationName= requestContext.operationName;
                    operationLog.documentNode= gqlRequestContext.context['req'].body.query;
                    operationLog.userAgent= gqlRequestContext.context['req'].headers['user-agent'];
                    operationLog.subpath=(requestContext.context['req'].headers['referer'] as string).split(requestContext.context['req'].headers['origin'] as string)[1];
                    operationLog.session= gqlRequestContext.context['req'].headers['cookie'];
                    operationLog.elapsed=`${requestEndTime.diff(requestStartTime, 'ms', true)} ms`
                    await getRepository(OperationEntity).save(operationLog);
                    // Logger.verbose(
                    //     `Query complexity "${requestContext.request.operationName ?? 'anonymous'}": ${complexity}`,
                    //     loggerCtx,
                    // );
                }
                if (complexity >= maxQueryComplexity) {
                    Logger.error(
                        `Query complexity of "${
                            requestContext.request.operationName ?? 'anonymous'
                        }" is ${complexity}, which exceeds the maximum of ${maxQueryComplexity}`,
                        loggerCtx,
                    );
                    throw new InternalServerError(`Query is too complex`);
                }
            },
        };
    }
}

function isAdminApi(schema: GraphQLSchema): boolean {
    const queryType = schema.getQueryType();
    if (queryType) {
        return !!queryType.getFields().administrators;
    }
    return false;
}

/**
 * @description
 * A complexity estimator which takes into account List and PaginatedList types and can
 * be further configured by providing a customComplexityFactors object.
 *
 * When selecting PaginatedList types, the "take" argument is used to estimate a complexity
 * factor. If the "take" argument is omitted, a default factor of 1000 is applied.
 *
 * @docsCategory HardenPlugin
 */
export function defaultVendureComplexityEstimator(
    customComplexityFactors: { [path: string]: number },
    logFieldScores: boolean,
) {
    return (options: ComplexityEstimatorArgs): number | void => {
        const { type, args, childComplexity, field } = options;
        const namedType = getNamedType(field.type);
        const path = `${type.name}.${field.name}`;
        let result = childComplexity + 1;
        const customFactor = customComplexityFactors[path];
        if (customFactor != null) {
            result = Math.max(childComplexity, 1) * customFactor;
        } else {
            if (isObjectType(namedType)) {
                const isPaginatedList = !!namedType.getInterfaces().find(i => i.name === 'PaginatedList');
                if (isPaginatedList) {
                    const take = args.options?.take ?? 1000;
                    result = childComplexity + Math.round(Math.log(childComplexity) * take);
                }
            }
            if (isListType(getNullableType(field.type))) {
                result = childComplexity * 5;
            }
        }
        if (logFieldScores) {
            Logger.debug(
                `${path}: ${field.type.toString()}\tchildComplexity: ${childComplexity}, score: ${result}`,
                loggerCtx,
            );
        }
        return result;
    };
}
