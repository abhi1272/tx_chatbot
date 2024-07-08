const SAM_PROJECT_ID = "exalted-gamma-428111-c9";

const SAM_INTENTS = ["getQuantity"];

const FIELD_MAPPING = {
  YarnCategory: "Yarn Category",
  SalesOffice: "Sales Office Name",
  MaterialGroupDesc: "Material Group Desc",
  BusinessLine: "Business Line",
  Blend: "Blend",
  CountofThreads : "Count of Threads",
  "date-period" : "Date"
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
  "SALE OFFICE",
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
  "Yarn Category" ,
  "Count of Yarn",
  "Blend",
];

const columnMapping = [
  {
      "value": "party_name",
      "synonyms": ["PARTY NAME", "party name", "Customer", "party", "customer name", "customers"]
  },
  {
      "value": "count",
      "synonyms": ["material code",,"MaterialCode", "SKU Code", "Code"]
  },
  {
      "value": "description",
      "synonyms": ["Material code description"]
  },
  {
      "value": "count_without_shade",
      "synonyms": ["COUNT W/O SHADE", "count shade", "Material Code without shade", "without shade"]
  },
  {
      "value": "sales_order_qty",
      "synonyms": ["SALES ORDER QTY", "sales order qty", "sales order", "sale order", "Order Qty", "Order Quantity"]
  },
  {
      "value": "delivered_qty",
      "synonyms": ["DELIVERED QTY", "delivered qty", "Delivered Quantity"]
  },
  {
      "value": "billed_qty",
      "synonyms": ["BILLED QTY", "billed qty", "Billed Quantity"]
  },
  {
      "value": "balance_qty",
      "synonyms": ["BALANCE QTY", "BalanceQty", "balance qty", "Pending Qty", "Pending Order Quantity", "Order Book", "Pending Order", "Pending Order book", "Balance Quantity", "Balance order book", "Order Size"]
  },
  {
      "value": "contract_rate",
      "synonyms": ["CONTRACT RATE", "contract rate"]
  },
  {
      "value": "sales_office_name",
      "synonyms": ["Sales Office Name","SalesOffice", "Office", "Sales Group"]
  },
  {
      "value": "material_group_desc",
      "synonyms": ["Material Group Desc","MaterialGroupDesc", "Material Group", "Material"]
  },
  {
      "value": "yarn_category",
      "synonyms": ["Yarn Category","YarnCategory", "Category"]
  },
  {
      "value": "blend",
      "synonyms": ["Blend"]
  },
  {
      "value": "business_line",
      "synonyms": ["Business Line", "BusinessLine", "LOB", "Business"]
  },
  {
      "value": "contract_qty",
      "synonyms": ["CONTRACT QTY", "Contract quantity"]
  },
  {
    "value": "date",
    "synonyms": ["order_date", "date", "Date", "DATE"]
  }
];

const PARTY_NAME = []
const Sales_Office_Name = []
const Business_Line = []
const Material_Group_Desc = []
const Yarn_Category = []
const Count_of_Threads = []
const Blend = []


module.exports = {
  SAM_PROJECT_ID,
  SAM_INTENTS,
  FIELD_MAPPING,
  FILTER_COLS,
  SUM_COLS,
  columnMapping
};
