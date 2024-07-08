const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");
const { fetchSheetData } = require("./sheet");
const cacheMethods = require("./cache");

// Create an in-memory SQLite database
const db = new sqlite3.Database(":memory:");

const createTableAndInsertData = async () => {
  const jsonData =  cacheMethods.get('sheetData')

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create table
      const createTableQuery = `
                CREATE TABLE pendingOrder (
                    sale_office TEXT,
                    customer TEXT,
                    party_name TEXT,
                    contract TEXT,
                    item TEXT,
                    date TEXT,
                    count TEXT,
                    description TEXT,
                    count_without_shade TEXT,
                    contract_qty INTEGER,
                    sales_order_qty INTEGER,
                    delivered_qty INTEGER,
                    billed_qty INTEGER,
                    balance_qty INTEGER,
                    contract_rate REAL,
                    material_group TEXT,
                    sales_group TEXT,
                    currency TEXT,
                    rate_option TEXT,
                    agent TEXT,
                    agent_name TEXT,
                    yarn_rate REAL,
                    to_include TEXT,
                    sales_office_name TEXT,
                    business_line TEXT,
                    material_group_desc TEXT,
                    yarn_category TEXT,
                    count_of_threads INTEGER,
                    blend TEXT
                )
            `;
      db.run(createTableQuery, (err) => {
        if (err) {
          return reject(err);
        }

        // Insert JSON data into the table
        const insertQuery = `
                    INSERT INTO pendingOrder (
                        sale_office, customer, party_name, contract, item, date, count, description,
                        count_without_shade, contract_qty, sales_order_qty, delivered_qty, billed_qty,
                        balance_qty, contract_rate, material_group, sales_group, currency, rate_option,
                        agent, agent_name, yarn_rate, to_include, sales_office_name, business_line,
                        material_group_desc, yarn_category, count_of_threads, blend
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                `;
        const stmt = db.prepare(insertQuery);
        jsonData.forEach((item) => {
          stmt.run(
            [
              item["SALE OFFICE"],
              item["CUSTOMER"],
              item["PARTY NAME"],
              item["CONTRACT"],
              item["ITEM"],
              item["DATE"],
              item["COUNT"],
              item["DESCRIPTION"],
              item["COUNT W/O SHADE"],
              item["CONTRACT QTY"],
              item["SALES ORDER QTY"],
              item["DELIVERED QTY"],
              item["BILLED QTY"],
              item["BALANCE QTY"],
              item["CONTRACT RATE"],
              item["MATERIAL GROUP"],
              item["SALES GROUP"],
              item["CURRENCY"],
              item["RATE OPTION"],
              item["AGENT"],
              item["AGENT NAME"],
              item["YARN RATE"],
              item["To Include"],
              item["Sales Office Name"],
              item["Business Line"],
              item["Material Group Desc"],
              item["Yarn Category"],
              item["Count of Threads"],
              item["Blend"],
            ],
            (err) => {
              if (err) {
                return reject(err);
              }
            }
          );
        });
        stmt.finalize();

        resolve();
      });
    });
  });
};

const runQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

const createTable = async () => {
  try {
    await createTableAndInsertData();
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  createTable,
  runQuery,
};
