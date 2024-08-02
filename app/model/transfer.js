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

        let transferDb = {
            sender_id: transferInput.sender_id,
            receiver_id: transferInput.receiver_id,
            type: 'transfer',
            point_amount: transferInput.point_amount,
            comment: transferInput.comment,
            slip_url: transferInput.slip_url
        }

        await Transfer.getBalanceByUserId(transferDb.sender_id)
            .then(result => {
                let balanceData = result.data;
                console.log(transferDb.sender_id, '-> Balance:', balanceData.balance)

                if (transferDb.sender_id !== transferDb.receiver_id) {
                    console.log('diff user name')

                    if (balanceData.balance > 0) {

                        // For example, check if point_amount to be transferred is less than or equal to the balance
                        if (balanceData.balance >= transferDb.point_amount) {

                            const transfer =
                                `INSERT INTO point_transfer SET ?`

                            sql.query(
                                transfer,
                                [transferDb], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
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

Transfer.earnPoint = function (voidInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        let earnDb = {
            sender_id: null,
            receiver_id: voidInput.receiver_id,
            type: 'earn',
            point_amount: voidInput.point_amount,
            comment: voidInput.comment,
            slip_url: voidInput.slip_url
        }

        if (earnDb.point_amount > 0) {
            const earn =
                `INSERT INTO point_transfer SET ?`

            sql.query(
                earn,
                [earnDb], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (!err) {
                        if (results.affectedRows > 0) {
                            // If successful
                            response.data = { message: 'Earn successful' };
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
            console.log('Balance is 0')
            response.status = false;
            response.errMsg = 'Balance is 0';
            response.statusCode = 400;
            reject(response);
        }
    })
}

Transfer.voidPoint = function (voidInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        let voidDb = {
            sender_id: voidInput.sender_id,
            receiver_id: null,
            type: 'void',
            point_amount: voidInput.point_amount,
            comment: voidInput.comment,
            slip_url: voidInput.slip_url
        }

        if (voidDb.point_amount > 0) {
            const vPoint =
                `INSERT INTO point_transfer SET ?`

            sql.query(
                vPoint,
                [voidDb], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                //call back function
                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                    if (!err) {
                        if (results.affectedRows > 0) {
                            // If successful
                            response.data = { message: 'Void successful' };
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
            console.log('Balance is 0')
            response.status = false;
            response.errMsg = 'Balance is 0';
            response.statusCode = 400;
            reject(response);
        }
    })
}

module.exports = Transfer