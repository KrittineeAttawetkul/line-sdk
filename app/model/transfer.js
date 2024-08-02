const sql = require('../../configs/db');

var Transfer = function () {
    this.created_at = new Date()
}

Transfer.getBalanceByUserId = function (user_id) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const balance =
            // `SELECT
            //     user_id,
            //     SUM(point_amount) AS balance
            // FROM
            //     (SELECT sender_id AS user_id, -point_amount AS point_amount FROM point_transfer
            // UNION ALL
            // SELECT receiver_id AS user_id, point_amount AS point_amount FROM point_transfer) AS all_transfers
            // GROUP BY user_id`;

            `SELECT
                user_id,
                SUM(point_amount) AS balance
            FROM
                (
                    SELECT 
                        sender_id AS user_id, 
                        -point_amount AS point_amount, 
                        type
                    FROM point_transfer
                    WHERE type = 'transfer'
                    UNION ALL

                    SELECT 
                        receiver_id AS user_id, 
                        point_amount AS point_amount, 
                        type
                    FROM point_transfer
                    WHERE type = 'transfer'
                    UNION ALL

                    SELECT 
                        sender_id AS user_id, 
                        -point_amount AS point_amount, 
                        type
                    FROM point_transfer
                    WHERE type = 'redeem'
                    UNION ALL

                    SELECT 
                        sender_id AS user_id, 
                        -point_amount AS point_amount, 
                        type
                    FROM point_transfer
                    WHERE type = 'void'
                    UNION ALL

                    SELECT 
                        receiver_id AS user_id, 
                        point_amount AS point_amount, 
                        type
                    FROM point_transfer
                    WHERE type = 'earn'
                ) AS all_transfers
            WHERE user_id = ?
            GROUP BY user_id;`

        try {
            sql.query(
                balance,
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

Transfer.transferPoint = function (transferInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        let pointDb = {
            sender_id:transferInput.sender_id,
            receiver_id:transferInput.receiver_id,
            type:'transfer',
            point_amount:transferInput.point_amount,
            comment:transferInput.comment,
            slip_url:transferInput.slip_url
        }

        await Transfer.getBalanceByUserId(pointDb.sender_id)
            .then(result => {
                let balanceData = result.data;
                console.log(pointDb.sender_id, '-> Balance:', balanceData.balance)

                if (pointDb.sender_id !== pointDb.receiver_id) {
                    console.log('diff user name')
                    // Assuming balanceData contains a field named 'balance' that holds the balance value
                    if (balanceData.balance > 0) {
                        // Continue with the transfer logic if balance is greater than 0

                        // For example, check if point_amount to be transferred is less than or equal to the balance
                        if (balanceData.balance >= pointDb.point_amount) {

                            const transfer =
                                `INSERT INTO point_transfer SET ?`

                            sql.query(
                                transfer,
                                [pointDb], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                                //call back function
                                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                                    if (!err) {
                                        if (results.affectedRows > 0) {
                                            // If successful
                                            response.data = { message: 'Transfer successful' };
                                            resolve(response);
                                        } else {
                                            // is not effective
                                            response.status = false;
                                            response.errMsg = 'บันทึกไม่สำเร็จ'
                                            resolve(response);
                                        }
                                    } else {
                                        response["status"] = false;
                                        response.errMsg = err;
                                        reject(response);
                                    }
                                }
                            )
                        } else {
                            // Insufficient balance
                            response.status = false;
                            response.errMsg = 'Insufficient balance';
                            response.statusCode = 400;
                            reject(response);
                        }
                    } else {
                        // Balance is not greater than 0
                        response.status = false;
                        response.errMsg = 'Balance is not sufficient';
                        response.statusCode = 400;
                        reject(response);
                    }
                }
                else {
                    console.log('same user name')
                    response.status = false;
                    response.errMsg = 'Same user name';
                    response.statusCode = 400;
                    reject(response);
                }


            })
            .catch(err => {
                response.status = false;
                response.errMsg = err.message || 'Error occurred';
                response.statusCode = 500;
                reject(response);
            });
    })
}

module.exports = Transfer