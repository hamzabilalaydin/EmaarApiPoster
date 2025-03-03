const request = require('request');
const sql = require("mssql/msnodesqlv8");
const { json } = require('express');


// ----!!!!BU KODU ÇALIŞTIRMAK İÇİN GÜN AYARINI DEĞİŞTİRMENİZ GEREKMEKTEDİR!!!!--- //


function roundUpToDecimal(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(num * factor) / factor;
}

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


const config = {
    server: "localhost",
    database: "NCR",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true // Uses,                                                                                                             
    }
};

async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("Connected to MSSQL using Windows Authentication!");

        const toplamFis = await pool.request().query('SELECT COUNT(DT) AS Fis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT > 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);');
        const gunlukCiro = await pool.request().query('SELECT SUM(AMT) AS Satis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)');
        const toplamKDV = await pool.request().query('SELECT SUM(T_VAT) AS KDV_Toplam FROM NCR.dbo.TDT_TRX WHERE T_STR = 1033 AND T_AMOUNT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)')

        gunlukCiro = roundUpToDecimal(gunlukCiro.recordset[0].Satis_Toplam - toplamKDV.recordset[0].KDV_Toplam, 2).toString()
        toplamFis = toplamFis.recordset[0].Fis_Toplam.toString()

        console.log({
            "PropertyCode": "ESM",
            "LeaseName": "NEZİH",
            "LeaseCode": "t0000042",
            "SaleType": "otherme",
            "SalesFromDate": formattedYesterday,
            "NetSalesAmount": gunlukCiro,
            "NoofTransactions": toplamFis,
            "SalesFrequency": "Daily"
        })
        sql.close();

    } catch (err) {
        console.error("Database connection failed!", err);
    }
}


function execute() {
    const options = {
        url: "https://api.emaar.com/emaar/trky/sales",
        method: "POST",
        json: [
            {
        "PropertyCode": "ESM",
        "LeaseName": "NEZİH",
        "LeaseCode": "t0000042",
        "SaleType": "otherme",
        "SalesFromDate": formattedYesterday,
        "NetSalesAmount": gunlukCiro,
        "NoofTransactions": toplamFis,
        "SalesFrequency": "Daily"
    }
    ],
    headers: {
        "x-api-key": "JfSxyPg2Qp",
      "Content-Type": "application/json"
    }
  };

  request(options, function (err, res, body) {
      if (err) {
          console.error("Error:", err);
        } else {
            console.log("Response:", body);
        }
    });
}

connectDB();
// execute();
