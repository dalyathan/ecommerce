/**
 * We need to add weight and weight unit of measure to the variants as custom fields. It is not required that all variants use
 * the same unit of measure: unit conversion is performed when evaluating the total order weight (see the relevant function)
 */

import { LanguageCode, CustomFields } from "@etech/core";

const ProductVariantCustomFields: CustomFields["ProductVariant"] = [
  {
    name: "weight",
    type: "float",
    ui:{suffix:'kg'},
    min: 0,
    label: [
      { languageCode: LanguageCode.en, value: "Weight" },
      { languageCode: LanguageCode.it, value: "Peso" },
    ],
  },
  // {
  //   name: "weightUoM",
  //   type: "string",
  //   nullable: true,
  //   options: [
  //     { value: "g" },
  //     { value: "kg" },
  //     // { value: 'lb' }, { value: 'oz' } TODO: add these UoM
  //   ],
  //   label: [
  //     { languageCode: LanguageCode.en, value: "Weight unit of measure" },
  //     { languageCode: LanguageCode.it, value: "Unità di misura per il peso" },
  //   ],
  // },
];

export default ProductVariantCustomFields;
