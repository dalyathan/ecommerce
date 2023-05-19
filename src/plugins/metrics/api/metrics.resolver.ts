import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@etech/core';
import { MetricsService } from './metrics.service';
import { MetricSummary, MetricSummaryInput } from '../../../ui/generated/graphql';

@Resolver()
export class MetricsResolver {
  constructor(private service: MetricsService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  async metricSummary(
    @Ctx() ctx: RequestContext,
    @Args('input') input:MetricSummaryInput
  ): Promise<MetricSummary[]> {
    return this.service.getMetrics(ctx, input);
  }
}
