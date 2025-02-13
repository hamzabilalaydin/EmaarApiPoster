const https = require('https');
const request = require('request');

const data = JSON.stringify({
  key1: 'value1',
  key2: 'value2'
});

const options = {
  hostname: 'https://apidev.emaar.com', // Replace with your API's hostname
  port: 443, // Use 80 for HTTP, 443 for HTTPS
  path: '/etenantsales/casualsales/', // Replace with the endpoint path
  method: 'POST',
  "json": {
        "SalesInfo": [
          {
            "UnitNo": "TDM-FF-121",
            "LeaseCode": "t0004680",
            "SalesDateFrom": "2025-01-01",
            "SalesDateTo": "2025-01-31",
            "TransactionCount": 213,
            "TotalSales": 5432,
            "Remarks": "Remarks"
          }
        ]
      },
  "headers": {
    "x-apikey": "e91rzXTCz2OFe6rSc2UNHwpMlqV7IhfM",
    "Accept": "application/json",
    "Content-Type": "application/json",
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

// Write data to request body
req.write(data);

// End the request
req.end();
