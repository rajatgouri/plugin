const fs = require('fs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
let jwt = require('jsonwebtoken');
let config = require('../config.js');
const middleware = require('../middleware.js');

module.exports = {
    readUser: (req, res) => {
        const newAd = req.body;
        if (req.body.username && req.body.password) {
            var sql = 'SELECT * FROM web_users WHERE email = ' + mysql.escape(req.body.username);
            db.query(sql, function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {
                    bcrypt.compare(req.body.password, results[0].password, function (err, response) {
                        if (response) {
                            let token = jwt.sign({ email: results[0].username }, config.secret, { expiresIn: '8h' });
                            results[0]["token"] = token;
                            res.send({ "status": 200, "error": null, "response": results })
                        } else {
                            res.send({ "status": 401, "error": "Username/Password Incorrect", "response": "" })
                        }
                    });
                } else {
                    res.send({ "status": 401, "error": "User Not Found", "response": "" })
                }
            })
        } else {
            res.send({ "status": 401, "error": "Username/Password Not available", "response": "" })
        }
    },

    apiUser: (req, res) => {
        if (req.body.api_key) {
            var sql = 'SELECT * FROM `web_users` WHERE `api_key` = ' + mysql.escape(req.body.api_key);
            db.query(sql, function (error, results, fields) {
                if (error) throw error;

                if (results.length > 0) {
                    res.send({ "status": 200, "error": null, "response": "" });
                } else {
                    res.send({ "status": 401, "error": "User Not Found", "response": "" });
                }
            });
        } else {
            res.send({ "status": 401, "error": "Username/Password Not available", "response": req.body });
        }
    },

    addUser: (req, res) => {
        if (req.body.Email) {
            var sql = 'SELECT * FROM web_users WHERE email = ' + mysql.escape(req.body.Email);
            db.query(sql, function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    res.send({ "status": 409, "error": "User Already Registered", "response": "" })
                } else {
                    var password = bcrypt.hash(req.body.Password, 10, function (err, hash) {
                        if (err) throw err;
                        var apiKey = require('crypto').randomBytes(64).toString('base64');
                        var userName = req.body.FirstName + ' ' + req.body.LastName;
                        var sql = "INSERT INTO `web_users` (`name`, `password`, `email`, `mobile`, `landline`, `street_address`, `city`, `state`, `zipcode`, `industry`,`api_key`) VALUES ('" + userName + "', '" + hash + "', '" + req.body.Email + "', '" + req.body.MobileNo + "', '', '', '', '', '" + req.body.Zipcode + "', ''," + mysql.escape(apiKey) + ");";
                        db.query(sql, function (error, results, fields) {
                            if (error) throw error;
                            res.send({ "status": 200, "error": "", "response": "User Registered Successfully" })
                        })
                    });
                }
            })
        } else {
            res.send({ "status": 400, "error": "Email required", "response": "" })
        }
    },
    getUserList: (req, res) => {
        if (req.headers) {
            var api_key = req.headers.api;
            var sql = 'SELECT * FROM `vendor_users` WHERE `vendor_id` = ' + mysql.escape(api_key);
            db.query(sql, function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    res.send({ "status": 409, "error": false, "response": results })
                }
            })
        } else {
            res.send({ "status": 400, "error": "User not found", "response": "" })
        }
    },

    deleteUserFromList: (req, res) => {
        let userId = req.body.id;
        let query = 'DELETE FROM `vendor_users` WHERE `id` = ' + mysql.escape(userId);
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                res.send({ "status": 200, "error": "User deleted", "response": result })
            }
        });
    },

    editUser: (req, res) => {
        let playerId = req.params.id;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let position = req.body.position;
        let number = req.body.number;

        let query = "UPDATE `players` SET `first_name` = '" + first_name + "', `last_name` = '" + last_name + "', `position` = '" + position + "', `number` = '" + number + "' WHERE `players`.`id` = '" + playerId + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deleteUser: (req, res) => {
        let playerId = req.params.id;
        let getImageQuery = 'SELECT image from `players` WHERE id = "' + playerId + '"';
        let deleteUserQuery = 'DELETE FROM players WHERE id = "' + playerId + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }

                    res.redirect('/');
                });
            });
        });
    },
    htmlencypt: (req, res) => {
        var tempArray = [];
        let html = '<div style="padding:20px;background:#ececec;">' +
            '<div style="text-align: center;font-family: arial;font-weight:600;font-size:38px;">' +
            '<h5>SNOW-EXTENSION</h5></div>' +
            '<div style="padding:30px;background:white;">' +
            '<span style="font-weight:600;font-size:20px;">Hi #firstName#,</span><br/>' +
            '<span style="font-weight:300;font-size:18px;color:#c5c5c5">Here are your password reset instructions</span>' +
            '<span  style="margin:10px"><hr></span>' +
            '<p  style="font-weight:300;font-size:18px;color:#8e8e8e">' +
            'A request to reset your Extension password has been made. If you did not make this request,simply ignore this email. If you did make this request.please reset your password this token will expire in 30 minutes: </p>' +
            '<p  style="font-weight:300;font-size:18px;color:#8e8e8e"><br>' +
            '#link#<br><br/>' +
            'Thank you,<br>' +
            'Team SNOW-EXTENSION' +
            '</p>' +
            '</div>'
        var ciphertext = CryptoJS.AES.encrypt(html, 'ram@gmail.com 1');
        tempArray.push(ciphertext);
        var sqlQuerry = "INSERT INTO `html_Ecyrpt` (`htmlEcyrpt`) VALUES ('" + tempArray + "');";
        db.query(sqlQuerry, function (err, result) {
            if (err) {
                res.send({ "status": 400, "error": "somthing went wrong", "response": err });
            } else {
                res.send({ "status": 200, "error": null, "response": "Html bcrypted" });
            }
        });
    },
    htmldcrypt: (req, res) => {
        var sqlQuerry = "SELECT * FROM html_Ecyrpt WHERE id=1;";
        db.query(sqlQuerry, function (err, result) {
            if (err) {
                res.send({ "status": 400, "error": "somthing went wrong", "response": err });
            } else {
                var bytes = CryptoJS.AES.decrypt(result[0].htmlEcyrpt.toString(), 'ram@gmail.com 1');
                var plaintext = bytes.toString(CryptoJS.enc.Utf8);
                res.send({ "status": 200, "error": null, "response": plaintext });
            }
        });
    },


    /* Add Procedure */

    addProcedure: (req, res) => {
        if (req.body) {
            var sql = "INSERT INTO `add_procedure` (`backview`, `selected_image`, `select_procedure`, `surguries`, `surgery_name`, `disclaimer`, `description`, `price`, `discount`) VALUES ('" + req.body.backview + "', '" + req.body.image_selected + "', '" + req.body.plastic_surgery + "', '" + req.body.surgical_type_selected + "',  '" + req.body.surgical_process_selected + "', '" + req.body.disclaimer + "', '" + req.body.description + "', '" + req.body.price + "', '" + req.body.discount + "');";
            db.query(sql, function (error, results) {
                if (error) throw error;
                if (results){
                    res.send({ "status": 200, "error": "", "response": "Procedure added Successfully" })
                }
            })
        } else {
            res.send({ "status": 400, "error": "something went wrong", "response": "" })
        }
    },

    upadteProcedure: (req, res) => {
        if (req.body) {
            var sql = "UPDATE `add_procedure` SET `backview`='" + req.body.backview + "', `selected_image`='" + req.body.image_selected + "', `select_procedure`='" + req.body.plastic_surgery + "', `surguries`='" + req.body.surgical_type_selected + "', `surgery_name`='" + req.body.surgical_process_selected + "', `disclaimer`='" + req.body.disclaimer + "', `description`='" + req.body.description + "', `price`='" + req.body.price + "', `discount`='" + req.body.discount + "' WHERE `id` = '" + req.body.id + "'"; 
            db.query(sql, function (error, results) {
                if (error) throw error;
                if (results){
                    res.send({ "status": 200, "error": false, "response": "Procedure updated Successfully" })
                }
            })
        } else {
            res.send({ "status": 400, "error": "something went wrong", "response": "" })
        }
    },

    getProcedureList: (req, res) => {
        if (req.body) {
            var api_key = req.body.api;
            var sql = 'SELECT * FROM `add_procedure`;'
            db.query(sql, function (error, results, fields) {
                if (error) throw error;
                if (results.length > 0) {
                    res.send({ "status": 200, "error": "procedure sent", "response": results })
                }
            })
        } else {
            res.send({ "status": 400, "error": "Procedure not found", "response": "" })
        }
    },

    deleteProcedureFromList: (req, res) => {
        let procedureId = req.body.id_val;
        let query = 'DELETE FROM `add_procedure` WHERE `id` = ' + mysql.escape(procedureId);
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                res.send({ "status": 200, "error": "Procedure deleted", "response": result })
            }
        });
    },
};