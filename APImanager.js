"use strict"
const fs = require('fs');
const fetch = require('node-fetch');

// API key
let rawjson = fs.readFileSync('APIkey.json');
let mykey = JSON.parse(rawjson);

//list of S&P companies
let listOfCompanies;
// Companies that were unsuccessfully fetched
let unfetchedCompanies = [];

// Fetch S&P companies
async function get_SandP_companies(){
    let url = 'https://finnhub.io/api/v1/index/constituents?symbol=^GSPC&token='+ mykey.key;
    console.log("Fetching S&P 500 companies");
    try{
        let response = await fetch(url);
        listOfCompanies = await response.json();
        console.log("Successfully fetched S&P companies");
        return true; // Successful
    }
    catch(err){
        console.log(err);
        return false; // Unsuccessful try again
    }

}

// Delay function to block code as not to spam api calls when api quota is reached
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
        console.log("Error for company: " + symbol);
        // Put company symbol on a list so we can try again later
        unfetchedCompanies.push(symbol);
        console.log(err);
        return;
    }
    console.log("Data for : " + symbol);
    console.log(ohlcData);
    // WRITE TO DATABASE COMING SOON
}
// One batch of companies = 25. this is to prevent errors from finnhub's API
function get_batch_of_companies(startingCompanyIndex){
    for(let i = startingCompanyIndex; i < (startingCompanyIndex + 25); i++){
        console.log("fetching for company No." + (i+1) + " : " + listOfCompanies.constituents[i]);
        get_full_OHLC_history(String(listOfCompanies.constituents[i]));
    }
}

// Basically a main()
async function get_all_data(){
    let fetched500companies = false;
    // Keep try until successful
    while(!fetched500companies){
        fetched500companies = await get_SandP_companies();
        if(!fetched500companies) delay(500);// Delay if unsuccessful
    }
    
    // fetch all api data in batches of 25 companies every 25 seconds
    //get_batch_of_companies(0);
    for(let i = 0; i < 500; i+=25){
        setTimeout(get_batch_of_companies, 25000*(i/25), i);
    }
    //setTimeout(()=>console.log(unfetchedCompanies), 1500);
}

get_all_data();
//test for individual case
//get_full_OHLC_history("MMM");