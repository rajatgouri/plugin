var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root"
});
//apiwebspero_plugin
//0KyE}DOJH;d+
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});