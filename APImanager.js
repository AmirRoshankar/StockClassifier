"using strict"
const fs = require('fs');
const fetch = require('node-fetch');

// API key
let rawjson = fs.readFileSync('APIkey.json');
let mykey = JSON.parse(rawjson);

// Fetch S&P companies
function get_SandP_companies(){
    let url = 'https://finnhub.io/api/v1/index/constituents?symbol=^GSPC&token='+ mykey.key;
    let companies;
    fetch(url)
    .then(res => res.json())
    .then(json => {
        console.log(json);
        // Save to a json file
        companies = json;
        fs.writeFile('S&P500companies.json', JSON.stringify(json), (err)=>{
            if(err) throw err;
            console.log('saved');
        });
    })
    .catch(err => {
        console.log(err);
    });
}

async function get_full_OHLC_history(symbol){
    // Get current time and a year ago in Epoch format
    let currentTime = Math.floor(+new Date() / 1000);
    let lastYear = Math.floor(+new Date() / 1000) - 31536000;
    // Construct API url to retrieve OHLC data from a year ago to present day
    let url = 'https://finnhub.io/api/v1/stock/candle?symbol=' + symbol + '&resolution=D&from=' + lastYear + '&to=' + currentTime + '&token=' + mykey.key;
    let ohlcData;
    // Fetch OHLC data
    try{
        // Synchronous 
        let response = await fetch(url);
        ohlcData = await response.json();
    }
    catch(err){
        console.log(err);
        return;
    }
    console.log(ohlcData);
}

// Test function with 3M
get_full_OHLC_history("MMM");

