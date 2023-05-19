import { OrderPlacedStrategy, RequestContext, OrderState, Order } from "@etech/core";

export class EthiolabOrderPlacedStrategy implements OrderPlacedStrategy {
    shouldSetAsPlaced(
        ctx: RequestContext,
        fromState: OrderState,
        toState: OrderState,
        order: Order,
    ): boolean {
        return fromState === 'AddingItems' &&
            (toState === 'ArrangingPayment')
            ? true
            : false;
    }
}