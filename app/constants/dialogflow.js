const SAM_PROJECT_ID = "exalted-gamma-428111-c9";

const SAM_INTENTS = ["getQuantity"];

const FIELD_MAPPING = {
  YarnCategory: "Yarn Category",
  SalesOffice: "Sales Office Name",
  MaterialGroupDesc: "Material Group Desc",
  BusinessLine: "Business Line",
};

const FILTER_COLS = [
  "SalesOfficeName",
  "MaterialGroupDesc",
  "YarnCategory",
  "Blend",
  "BusinessLine"
]

const SUM_COLS = [
  "BALANCE QTY",
  "SALES ORDER QTY",
  "CONTRACT QTY",
  "BILLED QTY",
  "BALANCE QTY",
  "DELIVERED QTY"
];

const FIELDS = [
  { "SALE OFFICE": "" },
  "CUSTOMER",
  "PARTY NAME",
  "CONTRACT",
  "ITEM",
  "DATE",
  "COUNT",
  "DESCRIPTION",
  "COUNT W/O SHADE",
  "CONTRACT QTY",
  "SALES ORDER QTY",
  "DELIVERED QTY",
  "BILLED QTY",
  "BALANCE QTY",
  "CONTRACT RATE",
  "MATERIAL GROUP",
  "SALES GROUP",
  "CURRENCY",
  "RATE OPTION",
  "AGENT",
  "AGENT NAME",
  "YARN RATE",
  "Sales Office Name",
  "Business Line",
  "Material Group Desc",
  { YarnCategory: "Yarn Category" },
  "Count of Yarn",
  "Blend",
];

module.exports = {
  SAM_PROJECT_ID,
  SAM_INTENTS,
  FIELD_MAPPING,
  FILTER_COLS,
  SUM_COLS
};
