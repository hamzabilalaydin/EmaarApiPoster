import requests
import pyodbc
from flask import Flask, jsonify
from datetime import datetime, timedelta

# MSSQL Bağlantısı Yapma (10.0.0.64 sunucusuna bağlanacak şekilde güncelledik)
def connect_to_mssql():
    connection_string = 'Driver={ODBC Driver 17 for SQL Server};Server=10.0.0.64;Database=NCR;Trusted_Connection=yes;'
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    return cursor

# SQL Veritabanı Sorguları
def fetch_data():
    cursor = connect_to_mssql()
    
    # Toplam Fiş
    cursor.execute('SELECT COUNT(DT) AS Fis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT > 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE);')
    toplam_fis = cursor.fetchone()[0]
    
    # Günlük Ciro
    cursor.execute('SELECT SUM(AMT) AS Satis_Toplam FROM NCR.dbo.TDT_HEADER WHERE STR = 1033 AND AMT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)')
    gunluk_ciro = cursor.fetchone()[0]
    
    # Toplam KDV
    cursor.execute('SELECT SUM(T_VAT) AS KDV_Toplam FROM NCR.dbo.TDT_TRX WHERE T_STR = 1033 AND T_AMOUNT != 0 AND CAST(DT AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)')
    toplam_kdv = cursor.fetchone()[0]

    return toplam_fis, gunluk_ciro, toplam_kdv

# API'ye Veri Gönderme
def send_data_to_api(gunluk_ciro, toplam_fis, formatted_yesterday):
    url = "https://api.emaar.com/emaar/trky/sales"
    payload = [{
        "PropertyCode": "ESM",
        "LeaseName": "NEZİH",
        "LeaseCode": "t0000042",
        "SaleType": "otherme",
        "SalesFromDate": formatted_yesterday,  # Dün tarihini kullanıyoruz
        "NetSalesAmount": gunluk_ciro,
        "NoofTransactions": toplam_fis,
        "SalesFrequency": "Daily"
    }]
    
    # Göndermeden önce çıktıyı ekrana yazdırıyoruz
    print("Gönderilecek JSON Verisi:")
    print(payload)

    headers = {
        "x-api-key": "JfSxyPg2Qp",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        print("Veri başarıyla gönderildi:", response.json())
    else:
        print(f"Error: {response.status_code} - {response.text}")

# Dün Tarihini Hesapla
def get_yesterday():
    yesterday = datetime.now() - timedelta(1)
    return yesterday.strftime("%m/%d/%Y")  # Tarihi MM/DD/YYYY formatında döndür

# Flask Uygulaması
app = Flask(__name__)

@app.route('/')
def index():
    # Dün tarihini hesapla
    formatted_yesterday = get_yesterday()
    
    # Veritabanı verilerini çek
    toplam_fis, gunluk_ciro, toplam_kdv = fetch_data()
    
    # Günlük Ciro ve Fiş Sayısını API'ye Gönder
    send_data_to_api(gunluk_ciro - toplam_kdv, toplam_fis, formatted_yesterday)
    
    return jsonify({
        "PropertyCode": "ESM",
        "LeaseName": "NEZİH",
        "LeaseCode": "t0000042",
        "SaleType": "otherme",
        "SalesFromDate": formatted_yesterday,  # Dün tarihini kullanıyoruz
        "NetSalesAmount": round(gunluk_ciro - toplam_kdv, 2),
        "NoofTransactions": toplam_fis,
        "SalesFrequency": "Daily"
    })

if __name__ == '__main__':
    app.run(debug=True)
