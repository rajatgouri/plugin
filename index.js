const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
const querystring = require('querystring');
const middleware = require('./middleware.js');
const http = require('http');
const fs = require('fs');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const {addUser, deleteUser, editUser,deleteUserFromList, readUser, apiUser,htmlencypt,htmldcrypt,getUserList,addProcedure,getProcedureList,upadteProcedure,deleteProcedureFromList} = require('./routes/user');


//Local Server
const db = mysql.createConnection ({
	host: "localhost",
	user: "root",
	password: "",
	database:"apiwebspero_plugin"
});

//Live Server
/*
const db = mysql.createConnection({
  host: "localhost",
  user: "apiwebspero_plugin",
  password: "0KyE}DOJH;d+",
  database : "apiwebspero_plugin"
});
*/
//pm2 start index.js --watch || pm2 stop 0
// connect to database
 db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db; 

// create express app
const app = express();
app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

//Store password Formula
//bcrypt.hash('myPassword', 10, function(err, hash) {});

// defining an array to work as the database (temporary solution)
const ads = [
  {title: 'Hello, world (again)!'}
];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// adding Helmet to enhance your API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// defining an endpoint to return all ads
app.get('/', (req, res) => {
	res.send(ads);
});

app.post('/authenticate',apiUser);
app.post('/register', addUser);
app.post('/login', readUser);
app.post('/htmlcrypt',middleware.checkToken, htmlencypt);
app.get('/htmldcrypt',middleware.checkToken, htmldcrypt);
app.get('/getUser',middleware.checkToken, getUserList);
app.post('/deleteUser',middleware.checkToken, deleteUserFromList);
app.post('/addProcedure',middleware.checkToken, addProcedure);
app.get('/getProcedureList',middleware.checkToken,getProcedureList);
app.post('/upadteProcedure',middleware.checkToken,upadteProcedure);
app.post('/deleteProcedure',middleware.checkToken,deleteProcedureFromList);

// listen for requests
app.listen(4000, () => {
    console.log("Server is listening on port 3000");
});


module.exports = app;