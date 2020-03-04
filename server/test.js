var mi = require('mediainfo-wrapper');
mi("downloads/AutoComplete_Mar-03_252941_5130.mp4").then(function(data) {
  for (var i in data) {
    console.log(JSON.stringify(data[i], null, 4));
  }
}).catch(function (e){console.error(e)});