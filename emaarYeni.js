const axios = require('axios');
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

let toplamFis;
let gunlukCiro;
let toplamKDV;

// Farklı bir sunucuya bağlanacak şekilde config'i güncelleyebilirsiniz:
const config = {
    server: "10.0.0.64", // Burada farklı server'ın IP adresini ya da domain'ini kullanmalısınız.
    database: "NCR",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true // Sunucunun güvenli bağlantısını kullan
    }
};

async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("Connected to MSSQL using Windows Authentication!");

        toplamFis = await pool.request().query('SELECT COUNT(DT) AS Fis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT > 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);');
        gunlukCiro = await pool.request().query('SELECT SUM(AMT) AS Satis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)');
        toplamKDV = await pool.request().query('SELECT SUM(T_VAT) AS KDV_Toplam FROM NCR.dbo.TDT_TRX WHERE T_STR = 1033 AND T_AMOUNT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)')

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
        });
        sql.close();
        bilgiGonder();

    } catch (err) {
        console.error("Database connection failed!", err);
    }
}

function log() {
    console.log(formattedYesterday);
    console.log(toplamFis);
    console.log(gunlukCiro);
}

async function bilgiGonder() {
    const data = [{
        "PropertyCode": "ESM",
        "LeaseName": "NEZİH",
        "LeaseCode": "t0000042",
        "SaleType": "otherme",
        "SalesFromDate": formattedYesterday,
        "NetSalesAmount": gunlukCiro,
        "NoofTransactions": toplamFis,
        "SalesFrequency": "Daily"
    }];
    
    // API sunucusunun adresini de değiştirebilirsiniz:
    const options = {
        url: "https://api.emaar.com/emaar/trky/sales", // API adresini değiştirme
        method: "POST",
        headers: {
            "x-api-key": "JfSxyPg2Qp",
            "Content-Type": "application/json"
        },
        data: data
    };

    try {
        const response = await axios(options);
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error);
    }
}

connectDB();
