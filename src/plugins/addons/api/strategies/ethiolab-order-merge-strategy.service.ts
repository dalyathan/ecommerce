import { Injector, MergedOrderLine, Order, OrderLine, OrderMergeStrategy, RequestContext, toMergedOrderLine } from "@etech/core";


export class EthiolabOrderMergeStartegy implements OrderMergeStrategy{
    merge(ctx: RequestContext, guestOrder: Order, existingOrder: Order): MergedOrderLine[] {
        const mergedLines: MergedOrderLine[] = existingOrder.lines.map(toMergedOrderLine);
        const guestLines = guestOrder.lines.slice();
        for (const guestLine of guestLines.reverse()) {
            const existingLine = this.findCorrespondingLine(existingOrder, guestLine);
            if (!existingLine) {
                mergedLines.unshift(toMergedOrderLine(guestLine));
            } else {
                const matchingMergedLine = mergedLines.find(l => l.orderLineId === existingLine.id);
                if (matchingMergedLine) {
                    matchingMergedLine.quantity += guestLine.quantity;
                }
            }
        }
        return mergedLines;
    }

    private findCorrespondingLine(existingOrder: Order, guestLine: OrderLine): OrderLine | undefined {
        return existingOrder.lines.find(
            line =>
                line.productVariant.id === guestLine.productVariant.id &&
                JSON.stringify(line.customFields) === JSON.stringify(guestLine.customFields),
        );
    }
    init?: (injector: Injector) => void | Promise<void>;
    destroy?: () => void | Promise<void>;

}