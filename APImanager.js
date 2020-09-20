"use strict"
const fs = require('fs');
const fetch = require('node-fetch');

// API key
let rawjson = fs.readFileSync('APIkey.json');
let mykey = JSON.parse(rawjson);

let listOfCompanies;

// Fetch S&P companies
async function get_SandP_companies(){
    let url = 'https://finnhub.io/api/v1/index/constituents?symbol=^GSPC&token='+ mykey.key;
    console.log("Fetching S&P 500 companies");
    try{
        let response = await fetch(url);
        listOfCompanies = await response.json();
    }
    catch(err){
        console.log(err);
        return;
    }

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    console.log("Data for : " + symbol);
    console.log(ohlcData);
    // WRITE TO DATABASE COMING SOON
}

// Basically a main()
async function get_all_data(){
    await get_SandP_companies();
    // Issue with the api call quota. 60 does not seem to be correct
    for(let i = 0; i < 40; i++){
        console.log("fetching for company No." + (i+1) + " : " + listOfCompanies.constituents[i]);
        get_full_OHLC_history(String(listOfCompanies.constituents[i]));
    }
}

get_all_data();
//test for individual case
//get_full_OHLC_history("MMM");