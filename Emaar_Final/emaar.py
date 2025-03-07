import pyodbc
import requests
import datetime

# Dünün tarihini hesapla
yesterday = datetime.date.today() - datetime.timedelta(days=1)
formatted_yesterday = yesterday.strftime('%m/%d/%Y')

# MSSQL bağlantı bilgileri
server = '10.0.0.64'
database = 'NCR'
conn_str = (
    f'DRIVER={{SQL Server}};'
    f'SERVER={server};'
    f'DATABASE={database};'
    f'Trusted_Connection=yes;'
)

# Veritabanına bağlan ve sorguları çalıştır
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(DT) AS Fis_Toplam
        FROM NCR.dbo.TDT_HEADER
        WHERE STR = 1033 AND AMT > 0 
        AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);
    """)
    toplam_fis = cursor.fetchone()[0]

    cursor.execute("""
        SELECT SUM(AMT) AS Satis_Toplam
        FROM NCR.dbo.TDT_HEADER
        WHERE STR = 1033 AND AMT != 0 
        AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);
    """)
    gunluk_ciro = cursor.fetchone()[0]

    cursor.execute("""
        SELECT SUM(T_VAT) AS KDV_Toplam
        FROM NCR.dbo.TDT_TRX
        WHERE T_STR = 1033 AND T_AMOUNT != 0 
        AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);
    """)
    toplam_kdv = cursor.fetchone()[0]
    
    # Net Satış Miktarını hesapla
    net_satis = round(gunluk_ciro - toplam_kdv, 2)

    # Bağlantıyı kapat
    conn.close()
    
    # JSON verisini oluştur
    data = [{
        "PropertyCode": "ESM",
        "LeaseName": "NEZİH",
        "LeaseCode": "t0000042",
        "SaleType": "otherme",
        "SalesFromDate": formatted_yesterday,
        "NetSalesAmount": str(net_satis),
        "NoofTransactions": str(toplam_fis),
        "SalesFrequency": "Daily"
    }]

    # Çıktıyı ekrana yazdır
    print("Gönderilecek Veri:", data)

    # API'ye POST isteği gönder
    headers = {
        "x-api-key": "JfSxyPg2Qp",
        "Content-Type": "application/json"
    }

    response = requests.post("https://api.emaar.com/emaar/trky/sales", json=data, headers=headers)
    print("API Response:", response.text)

except Exception as e:
    print("Hata oluştu:", e)


