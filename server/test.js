var mi = require('mediainfo-wrapper');
mi("downloads/5J7NNHC3ZZC5NONAWWMRCZ6R6U.jpeg").then(function(data) {
  for (var i in data) {
    console.log(JSON.stringify(data[i], null, 4));
  }
}).catch(function (e){console.error(e)});