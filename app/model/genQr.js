"user strict";
let sql = require("../../configs/db");
const QRCode = require('qrcode');
const fs = require('fs');
const path = require("path");

//Task object constructor
var GenQr = function (user) {
    this.created_at = new Date();
};

GenQr.Register = function (inputBody) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        let data = {
            user_id: inputBody.userId,
            display_name: inputBody.displayName,
            tel: inputBody.tel
        };

        // console.log(data);

        let fileName = `qrcode_${data.user_id}.png`;
        let uploadDir = path.join(__dirname, '../../uploads');
        let pathUpload = path.join(uploadDir, fileName);

        try {
            await GenQr.genFromUserId(data.user_id, pathUpload);
            let qrURL = { qr_url: '/images/' + fileName };
            Object.assign(data, qrURL);

            let checkDB = "SELECT * FROM lineprofile WHERE user_id = ? OR tel = ?";
            let checkDUL = "SELECT * FROM lineprofile WHERE user_id = ? AND tel = ?";
            let insert = 'INSERT INTO lineprofile SET ?';

            sql.query(checkDB, [data.user_id, data.tel], (err, results) => {
                if (err) {
                    return reject({
                        status: false,
                        errMsg: err.message
                    });
                }
                else if (results.length > 0) {

                    sql.query(checkDUL, [data.user_id, data.tel], (err, results) => {
                        if (err) {
                            return reject({
                                status: false,
                                errMsg: err.message
                            });
                        }
                        else if (results.length > 0) {
                            console.log('User already exists');
                            response.status = true;
                            response.data = 'User already exists';
                            return resolve(response); // Send response when duplicate is found
                        }
                        else {
                            console.log('Different user');
                            response.status = false;
                            response.data = 'Different user';
                            return resolve(response); // Send response when duplicate is found
                        }
                    });
                }
                else {
                    console.log('insert user')
                    sql.query(insert, data, (err, results) => {
                        if (err) {
                            return reject({
                                status: false,
                                errMsg: err.message
                            });
                        }
                        if (results.affectedRows > 0) {
                            response.status = true;
                            response.data = 'Success save record';
                            resolve(response);
                        } else {
                            response.status = false;
                            response.data = 'Failed to save record';
                            resolve(response);
                        }
                    });
                }
            });
        } catch (err) {
            reject({
                status: false,
                errMsg: err.message
            });
        }
    });
}

// process.on('unhandledRejection', (reason, promise) => {
//     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// });

GenQr.genFromUserId = function (user_id, pathUpload) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: ''
        }

        let qrData = 'NLCHR-MYQR-' + user_id;
        // Generate QR code and save as PNG
        QRCode.toFile(pathUpload, qrData, function (err) {
            if (err) {
                response.status = false;
                response.errMsg = err;
                reject(response);
            }
            else resolve(response);
        });
    })
}



module.exports = GenQr;