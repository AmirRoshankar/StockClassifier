"using strict"
const fs = require('fs');
let rawjson = fs.readFileSync('APIkey.json');
let key = JSON.parse(rawjson);
console.log("API key: ", key.key);