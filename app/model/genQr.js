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
            errMsg: ''
        };

        let data = {
            user_id: inputBody.userId,
            display_name: inputBody.displayName,
            picture_url: inputBody.pictureUrl,
            status_message: inputBody.statusMessage
        }

        let fileName = `qrcode_${data.user_id}.png`
        let uploadDir = path.join(__dirname, '../../uploads');
        let pathUpload = path.join(uploadDir, fileName);

        await this.genFromUserId(data.user_id, pathUpload)
            .then(response => {
                let qrURL = { qr_url: '/images/' + fileName }
                Object.assign(data, qrURL)

                let check = "SELECT * FROM lineprofile WHERE user_id = ?"
                let insert = 'INSERT INTO lineprofile SET ?';

                sql.query(check, [data.user_id], (err, results) => {
                    if (err) {
                        reject(response);
                    } else if (results.length > 0) {
                        console.log('User already exists')
                        resolve(response);
                    }
                    else {
                        sql.query(insert, [data], (err, results) => {
                            if (!err) {
                                if (results.affectedRows > 0) {
                                    resolve(response);
                                } else {
                                    // is not effective
                                    response.status = false;
                                    response.errMsg = 'บันทึกไม่สำเร็จ'
                                    resolve(response);
                                }
                                //console.log('results: ', results);
                            } else {
                                //console.log('----------------- Register ------------------');
                                //console.log('Error: ', err);
                                response["status"] = false;
                                response.errMsg = err;
                                reject(response);
                            }
                        });
                    }
                })
            })
            .catch(err => {
                reject(err);
            })
    })
}

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