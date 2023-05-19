/**
 * Gets total weight from an order, with output in a certain weight unit (g or kg)
 */

import { Order, OrderLine } from "@etech/core";
import { WeightUnit } from "./ui/types";

export const getOrderWeight: (order: Order) => number =
  (order) =>
    order.lines
      .map((line: OrderLine) => {
        const lineWeightUoM = (line.productVariant.customFields as any)
          .weightUoM;
        const lineWeight = line.productVariant.customFields.weight ?? 0;
        // if (lineWeightUoM === resultUnit) return lineWeight * line.quantity;
        // else {
        //   if (lineWeightUoM === "g") return (lineWeight / 1000) * line.quantity;
        //   else if (lineWeightUoM === "kg")
        //     return lineWeight * 1000 * line.quantity;
        // }
        return lineWeight * line.quantity;
      })
      .reduce((total, lineWeight) => total + lineWeight, 0);
