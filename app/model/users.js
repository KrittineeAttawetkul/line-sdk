const sql = require('../../configs/db');
const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const Register = require('./register');

var Users = function () {
    this.created_at = new Date()
}

Users.getUserByUserId = function (user_id) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const s = "SELECT * FROM lineprofile WHERE user_id = ?"

        try {
            sql.query(
                s,
                [user_id], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (err) {
                        console.log(err)
                        response.errMsg = err
                        response.status = false
                        response.statusCode = 500
                        reject(response)
                    }
                    else {
                        if (results.length > 0) {
                            response["data"] /* รูปแบบที่ 2 */ = results[0]; //ทำให้เป็๋น Obj
                        }
                        else {
                            response.status = false
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'
                        }
                        resolve(response)
                    }
                }
            )
        } catch (err) {
            reject(err)
        }

    })
}

Users.getQrByUserId = function (user_id) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const s = "SELECT qr_url  FROM lineprofile WHERE user_id = ?"
        // const s = `SELECT lp.*, clv.lv_name 
        //     FROM lineprofile lp 
        //     INNER JOIN card_lv clv ON 
        //     WHERE user_id = ? 
        // `

        try {
            sql.query(
                s,
                [user_id], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (err) {
                        console.log(err)
                        response.errMsg = err
                        response.status = false
                        response.statusCode = 500
                        reject(response)
                    }
                    else {
                        if (results.length > 0) {
                            response["data"] /* รูปแบบที่ 2 */ = results[0]; //ทำให้เป็๋น Obj
                        }
                        else {
                            response.status = false
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'
                        }
                        resolve(response)
                    }
                }
            )
        } catch (err) {
            reject(err)
        }

    })
}

Users.checkTel = function (req) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const c = "SELECT * FROM nilecon_tel WHERE tel = ?"
        // console.log(c)

        try {
            sql.query(
                c,
                [req.tel], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                async (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (err) {
                        console.log('checkTel =', err)
                        response.errMsg = err
                        response.status = false
                        response.statusCode = 500
                        reject(response)
                    } else {
                        if (results.length > 0) {
                            // response.status = true
                            // response["data"] /* รูปแบบที่ 2 */ = 'คุณเป็นพนักงาน Nilecon'; //ทำให้เป็๋น Obj

                            await Register.Registration(req, client).then(regResponse => {
                                // console.log('Register', regResponse);
                                resolve(regResponse)
                            }).catch(regError => {
                                console.error('Registration error:', regError);
                                reject(regError)
                            });
                        }
                        else {

                            response.status = false
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'
                            response["data"] /* รูปแบบที่ 2 */ = 'คุณไม่ได้เป็นพนักงาน Nilecon'; //ทำให้เป็๋น Obj
                            resolve(response)
                        }

                    }
                }
            )
        } catch (err) {
            reject(err)
        }

    })
}

Users.checkLogIn = function (req) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        const { username, password } = req

        const query = `
            SELECT 
                CASE 
                    WHEN username = ? THEN 
                        CASE WHEN password = ? THEN 'valid' ELSE 'invalid_password' END 
                    ELSE 'invalid_username' 
                END as login_status 
            FROM admin 
            WHERE username = ? OR username = ? LIMIT 1 /* checks the username twice */
        `;

        try {
            sql.query(
                query,
                [username, password, username, username],
                (err, results) => {
                    if (err) {
                        console.log('Error =', err);
                        response.errMsg = err;
                        response.status = false;
                        response.statusCode = 500;
                        reject(response);
                    } else if (results.length === 0) {
                        // No record found
                        response.status = false;
                        response.errMsg = 'Username not found';
                        response.data = 'Invalid username';
                        response.statusCode = 200;
                        resolve(response);
                    } else {
                        const loginStatus = results[0].login_status;
                        if (loginStatus === 'valid') {
                            // Valid username and password
                            response.status = true;
                            response.data = 'You are Admin Nilecon';
                            resolve(response);
                        } else if (loginStatus === 'invalid_password') {
                            // Username is correct but password is wrong
                            response.status = false;
                            response.errMsg = 'Incorrect password';
                            response.data = 'Invalid password';
                            response.statusCode = 200;
                            resolve(response);
                        } else if (loginStatus === 'invalid_username') {
                            // Username is not found
                            response.status = false;
                            response.errMsg = 'Username not found';
                            response.data = 'Invalid username';
                            response.statusCode = 200;
                            resolve(response);
                        }
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = Users