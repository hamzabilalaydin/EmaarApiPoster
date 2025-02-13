// Demo code sample. Not indended for production use.

// See instructions for installing Request module for NodeJS
// https://www.npmjs.com/package/request

const request = require('request');

function execute() {
  const options = {
    "url": "https://apidev.emaar.com/etenantsales/dailysales/",
    "method": "POST",
    "json": {
      "SalesDataCollection": {
        "SalesInfo": [
          {
            "UnitNo": "TDM-FF-121",
            "LeaseCode": "t0004680",
            "SalesDate": "2019-04-20",
            "TransactionCount": 213,
            "NetSales": 5432
          }
        ]
      }
    },
    "headers": {
      "x-apikey": "e91rzXTCz2OFe6rSc2UNHwpMlqV7IhfM",
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };
  request(options, function (err, res, body) {
    if (err) {
      console.error(err);
    }
    else {
      console.log(res.body);
    }
  });
}

execute();
