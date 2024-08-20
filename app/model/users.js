const sql = require('../../configs/db');
const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const Register = require('./register');
const richmenu = require('../../configs/richmenu');

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
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const c = "SELECT * FROM nilecon_tel WHERE tel = ?"

        try {
            sql.query(
                c,
                [req.tel], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
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
                            response["data"] /* รูปแบบที่ 2 */ = 'คุณเป็นพนักงาน Nilecon'; //ทำให้เป็๋น Obj
                            Register.Registration(req,client)
                        }
                        else {
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'
                            response["data"] /* รูปแบบที่ 2 */ = 'คุณไม่ได้เป็นพนักงาน Nilecon'; //ทำให้เป็๋น Obj
                            const Message = [
                                {
                                    type: 'text',
                                    text: 'คุณไม่ได้เป็นพนักงาน Nilecon'
                                }
                            ];
                            client.pushMessage(req.user_id, Message)
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

module.exports = Users