const warscrolls = require("./convert");
const fs = require('fs');

fs.writeFile('converted.json',JSON.stringify(warscrolls,null,2),()=>{})