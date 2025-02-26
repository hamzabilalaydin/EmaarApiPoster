const sql = require("mssql/msnodesqlv8");

const config = {
    server: "localhost",
    database: "deneme",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true // Uses Windows Authentication
    }
};


async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("Connected to MSSQL using Windows Authentication!");
        let gunlukCiro = "SELECT SUM(AMT) AS TotalAmount FROM NCR.dbo.TDT_HEADER WHERE STR = 1024 AND AMT != 0 AND DT BETWEEN '2025-02-19' AND '2025-02-20';"
        let result = await pool.request().query("SELECT Email FROM Persons WHERE FirstName='Yunus'" WHERE Data LIKE '^S[0-9]{55}1*$');
        console.log(result["recordset"]);
        console.log(gunlukCiro);
        sql.close();
    } catch (err) {
        console.error("Database connection failed!", err);
    }
}

connectDB();
