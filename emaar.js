const request = require('request');
const sql = require("mssql/msnodesqlv8");
const { json } = require('express');


// Today's Date
const today = new Date();
const mmToday = String(today.getMonth() + 1).padStart(2, '0'); // Get month, add 1 since months are 0-based
const ddToday = String(today.getDate()).padStart(2, '0'); // Get day of the month
const yyyyToday = today.getFullYear(); // Get year

const formattedToday = `${mmToday}/${ddToday}/${yyyyToday}`;


// Yesterday's Date
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1); // Subtract one day

const mmYesterday = String(yesterday.getMonth() + 1).padStart(2, '0');
const ddYesterday = String(yesterday.getDate()).padStart(2, '0');
const yyyyYesterday = yesterday.getFullYear();

const formattedYesterday = `${mmYesterday}/${ddYesterday}/${yyyyYesterday}`;


let gunlukCiro;
let toplamFis;


const config = {
    server: "localhost",
    database: "NCR",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true // Uses Windows Authentication
    }
};

async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("Connected to MSSQL using Windows Authentication!");

        gunlukCiro = await pool.request().query('SELECT COUNT(DT) AS toplamFis FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT > 0 AND DT >= CAST(DATEADD(DAY, -1, GETDATE()) AS DATE) AND DT < CAST(GETDATE() AS DATE)');
        toplamFis = await pool.request().query('SELECT SUM(AMT) AS totalAmount FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT != 0 AND DT >= CAST(DATEADD(DAY, -1, GETDATE()) AS DATE) AND DT < CAST(GETDATE() AS DATE)');
        
        console.log({
            "PropertyCode": "ESM",
            "LeaseName": "NEZİH",
            "LeaseCode": "t0000042",
            "SaleType": "otherme",
            "SalesFromDate": formattedYesterday,
            "NetSalesAmount": gunlukCiro.recordset[0].totalAmount.toString(),
            "NoofTransactions": toplamFis.recordset[0].toplamFis.toString(),
            "SalesFrequency": "Daily"
        })
        sql.close();
    } catch (err) {
        console.error("Database connection failed!", err);
    }
}


// function execute() {
//     const options = {
//         url: "https://api.emaar.com/emaar/trky/sales",
//         method: "POST",
//         json: [
//             {
//         "PropertyCode": "ESM",
//         "LeaseName": "NEZİH",
//         "LeaseCode": "t0000042",
//         "SaleType": "otherme",
//         "SalesFromDate": formattedDate,
//         "NetSalesAmount": gunlukCiro,
//         "NoofTransactions": fisToplam,
//         "SalesFrequency": "Daily"
//     }
//     ],
//     headers: {
//         "x-api-key": "JfSxyPg2Qp",
//       "Content-Type": "application/json"
//     }
//   };

//   request(options, function (err, res, body) {
//       if (err) {
//           console.error("Error:", err);
//         } else {
//             console.log("Response:", body);
//         }
//     });
// }

connectDB();
// execute();
