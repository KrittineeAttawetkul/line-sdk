const sql = require('../../configs/db');
const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const { getProfile } = require('../../utils/getLinePofile');
const Flex = require('./flexMessage');
const Reward = require('./reward');

var Transfer = function () {
    this.created_at = new Date()
}

Transfer.getBalanceByUserId = function (user_id) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: { balance: 0 },
            statusCode: 200
        }

        const balance =

            `SELECT
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
                            response.data = results[0]; //ทำให้เป็๋น Obj
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

Transfer.getCardByUserId = function (user_id) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        try {
            // Fetch the user's balance
            const result = await Transfer.getBalanceByUserId(user_id);
            const balance = result.data.balance;

            // Check if balance is 0
            if (balance === 0) {
                // response.status = false;
                response.errMsg = 'Balance is zero';
            }

            // Combined query to handle both within and beyond range cases
            const cardQuery = `
              (
                SELECT lv_name, card_url
                FROM card_lv
                WHERE point_req_min <= ? AND point_req_max >= ?
            )
            UNION ALL
            (
                SELECT lv_name, card_url
                FROM card_lv
                WHERE point_req_max < ?
                ORDER BY point_req_max DESC
                LIMIT 1
            )
            UNION ALL
            (
                SELECT lv_name, card_url
                FROM card_lv
                WHERE point_req_min > ?
                ORDER BY point_req_min ASC
                LIMIT 1
            )`;

            sql.query(cardQuery, [balance, balance, balance, balance], (err, results) => {
                if (err) {
                    response.status = false;
                    response.errMsg = 'Database query error';
                    response.statusCode = 500;
                    console.error(err); // Better logging
                    reject(response);
                } else if (results.length > 0) {
                    // Return the first result which will be either within range or the highest fallback
                    response.data = results[0];
                    response.data.balance = balance;
                } else {
                    // No card data found
                    response.errMsg = 'No card data available for the given balance';
                    response.statusCode = 404;
                }
                resolve(response);
            });
        } catch (err) {
            response.status = false;
            response.errMsg = 'An error occurred';
            response.statusCode = 500;
            console.error(err); // Better logging
            reject(response);
        }
    });
};



Transfer.transferPoint = function (transferInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const invoiceNum = generateInvoiceNumber()

        let transferDb = {
            invoice_num: invoiceNum,
            sender_id: transferInput.sender_id,
            receiver_id: transferInput.receiver_id,
            type: 'transfer',
            point_amount: transferInput.point_amount,
            comment: transferInput.comment
        }

        const sender = await getProfile(transferDb.sender_id)
        const receiver = await getProfile(transferDb.receiver_id)

        let slipPayLoad = {
            sender,
            receiver,
            client: client,
            transferInfo: transferInput,
            invoiceNum: invoiceNum
        }


        try {
            const balanceResult = await Transfer.getBalanceByUserId(transferDb.sender_id)
            let balanceData = balanceResult.data;
            console.log(transferDb.sender_id, '-> Balance:', balanceData.balance)

            if (transferDb.sender_id !== transferDb.receiver_id) {
                console.log('diff user name')

                if (balanceData.balance > 0) {

                    // For example, check if point_amount to be transferred is less than or equal to the balance
                    if (balanceData.balance >= transferDb.point_amount) {

                        if (transferDb.point_amount > 0) {

                            const transfer =
                                `INSERT INTO point_transfer SET ?`
                            sql.query(
                                transfer,
                                [transferDb], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                                //callback function
                                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                                    if (!err) {
                                        if (results.affectedRows > 0) {
                                            // If successful
                                            response.data = { message: 'Transfer successful' };
                                            Flex.senderSlip(slipPayLoad)
                                            Flex.receiverSlip(slipPayLoad)
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
                            console.log('point amount = 0')
                            response.status = false;
                            response.errMsg = 'point amount = 0';
                            response.statusCode = 200;
                            reject(response);
                        }
                    } else {
                        // Insufficient balance
                        response.status = false;
                        response.errMsg = 'Insufficient balance';
                        response.statusCode = 200;
                        reject(response);
                    }
                } else {
                    // Balance is not greater than 0
                    response.status = false;
                    response.errMsg = 'Balance is not sufficient';
                    response.statusCode = 200;
                    reject(response);
                }
            } else {
                console.log('same user name')
                response.status = false;
                response.errMsg = 'Same user name';
                response.statusCode = 200;
                reject(response);
            }
        } catch (err) {
            response.status = false;
            response.errMsg = err.message || 'Error occurred';
            response.statusCode = 500;
            reject(response);
        }
    })
}

Transfer.earnPoint = function (earnInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const invoiceNum = generateInvoiceNumber()

        let earnDb = {
            invoice_num: invoiceNum,
            sender_id: null,
            receiver_id: earnInput.receiver_id,
            type: 'earn',
            point_amount: earnInput.point_amount,
            comment: earnInput.comment
        }
        try {

            const receiver = await getProfile(earnDb.receiver_id)

            let slipPayLoad = {
                receiver,
                client: client,
                transferInfo: earnInput,
                invoiceNum: invoiceNum
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
                                Flex.earnSlip(slipPayLoad)
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
                console.log('point amount = 0')
                response.status = false;
                response.errMsg = 'point amount = 0';
                response.statusCode = 200;
                reject(response);
            }
        } catch (err) {
            console.log(err)
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

        const invoiceNum = generateInvoiceNumber()

        let voidDb = {
            invoice_num: invoiceNum,
            receiver_id: null,
            type: 'void',
        }

        const sender = await getProfile(voidInput.sender_id)

        let slipPayLoad = {
            sender,
            client: client,
            transferInfo: voidInput,
            invoiceNum: invoiceNum
        }

        Object.assign(voidInput, voidDb);

        await Transfer.getBalanceByUserId(voidInput.sender_id)
            .then(result => {
                let balanceData = result.data;
                console.log(voidInput.sender_id, '-> Balance:', balanceData.balance)

                if (balanceData.balance > 0) {

                    // For example, check if point_amount to be transferred is less than or equal to the balance
                    if (balanceData.balance >= voidInput.point_amount) {

                        if (voidInput.point_amount > 0) {

                            const vPoint = `INSERT INTO point_transfer SET ?`

                            sql.query(
                                vPoint,
                                [voidInput], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
                                //call back function
                                (err, results, fields) => { //results ที่ได้เป็นรูปแบบของ Array
                                    if (!err) {
                                        if (results.affectedRows > 0) {
                                            // If successful
                                            response.data = { message: 'Void successful' };
                                            Flex.voidSlip(slipPayLoad)
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
                            console.log('point amount = 0')
                            response.status = false;
                            response.errMsg = 'point amount = 0';
                            response.statusCode = 200;
                            reject(response);
                        }
                    } else {
                        // Insufficient balance
                        response.status = false;
                        response.errMsg = 'Insufficient balance';
                        response.statusCode = 200;
                        reject(response);
                    }
                } else {
                    // Balance is not greater than 0
                    response.status = false;
                    response.errMsg = 'Balance is not sufficient';
                    response.statusCode = 200;
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

Transfer.Redeem = function (RedeemInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        // Fetch reward details by reward_id before processing the redemption
        const reward = await Reward.getRewardByReward_id(RedeemInput.reward_id);

        if (!reward.status) {
            if (reward.errMsg === 'This reward has not started yet') {
                response.status = false;
                response.errMsg = 'This reward has not started yet';
                response.statusCode = 200;
                resolve(response);
            }
            else if (reward.errMsg === 'This reward has expired') {
                response.status = false;
                response.errMsg = 'This reward has expired';
                response.statusCode = 200;
                resolve(response);
            }
            else if (reward.errMsg === 'Sorry, this reward is out of stock') {
                response.status = false;
                response.errMsg = 'Sorry, this reward is out of stock';
                response.statusCode = 200;
                resolve(response);
            }
            else {
                // Check if the reward is not found
                response.status = false;
                response.errMsg = 'Reward not found'; // "Reward not found"
                // response.errMsg = 'ไม่พบรางวัลนี้'; // "Reward not found"
                response.statusCode = 404;
                resolve(response);
            }
        }
        else {
            // Continue with the redemption process if the reward hasn't been redeemed
            const invoiceNum = generateInvoiceNumber();

            let redeemDb = {
                sender_id: RedeemInput.sender_id,
                invoice_num: invoiceNum,
                receiver_id: null,
                point_amount: reward.data.reward_price,
                comment: reward.data.reward_name,
                type: 'redeem',
            }

            const sender = await getProfile(RedeemInput.sender_id);

            let slipPayLoad = {
                sender,
                client: client,
                transferInfo: RedeemInput,
                invoiceNum: invoiceNum,
                reward_name: reward.data.reward_name
            }

            Object.assign(RedeemInput, redeemDb);

            // Continue with checking balance and point amount
            await Transfer.getBalanceByUserId(RedeemInput.sender_id)
                .then(result => {
                    let balanceData = result.data;
                    console.log(RedeemInput.sender_id, '-> Balance:', balanceData.balance);

                    if (balanceData.balance > 0) {

                        // Check if point_amount to be transferred is less than or equal to the balance
                        if (balanceData.balance >= RedeemInput.point_amount) {

                            if (RedeemInput.point_amount > 0) {

                                const rPoint = `INSERT INTO point_transfer SET ?`;

                                sql.query(rPoint, [redeemDb], (err, results, fields) => {
                                    if (!err) {
                                        if (results.affectedRows > 0) {
                                            // Insert into reward_history after successful redeem
                                            const rewardHistoryInsertQuery = `INSERT INTO reward_history SET ?`;

                                            let rewardDb = {
                                                user_id: RedeemInput.sender_id,
                                                reward_id: RedeemInput.reward_id,
                                                invoice_num: invoiceNum,
                                                reward_status: 'n'
                                            }

                                            // console.log(rewardDb);

                                            sql.query(rewardHistoryInsertQuery, rewardDb, (err, historyResult) => {
                                                if (err) {
                                                    response.status = false;
                                                    response.errMsg = 'Error inserting into reward history';
                                                    response.statusCode = 500;
                                                    return reject(response);
                                                }

                                                if (historyResult.affectedRows > 0) {
                                                    // Successfully inserted into reward_history
                                                    response.data = { message: 'Redeem successful and added to reward history' };
                                                    Flex.redeemSlip(slipPayLoad)
                                                    resolve(response);
                                                } else {
                                                    response.status = false;
                                                    response.errMsg = 'Failed to add to reward history';
                                                    return reject(response);
                                                }
                                            });
                                        } else {
                                            response.status = false;
                                            response.errMsg = 'Transaction failed';
                                            resolve(response);
                                        }
                                    } else {
                                        response.status = false;
                                        response.errMsg = err;
                                        reject(response);
                                    }
                                });
                            } else {
                                console.log('point amount = 0');
                                response.status = false;
                                response.errMsg = 'Point amount cannot be 0';
                                response.statusCode = 200;
                                reject(response);
                            }
                        } else {
                            // Insufficient balance
                            response.status = false;
                            response.errMsg = 'Insufficient balance';
                            response.statusCode = 200;
                            reject(response);
                        }
                    } else {
                        // Balance is not greater than 0
                        response.status = false;
                        response.errMsg = 'Insufficient balance';
                        response.statusCode = 200;
                        reject(response);
                    }
                })
                .catch(err => {
                    response.status = false;
                    response.errMsg = err.message || 'Error occurred';
                    response.statusCode = 500;
                    reject(response);
                });
        }
    });
}


Transfer.getDataByInvoiceNum = function (invoice_num) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        const s = "SELECT * FROM point_transfer WHERE invoice_num = ? AND (type = 'earn' OR type = 'redeem' OR type = 'void')";

        try {
            sql.query(
                s,
                [invoice_num], // ค่าที่รับเข้ามาเพื่อทำการค้นหา
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
                            response["data"] /* รูปแบบที่ 2 */ = results; //ทำให้เป็๋น Obj // Return all matching records
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

Transfer.voidEarn = function (voidInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        try {
            const result = await Transfer.getDataByInvoiceNum(voidInput.invoice_num);
            let data = result.data;
            console.log('Data', data);

            const sender = await getProfile(data[0].receiver_id);

            let hasEarn = false;
            let hasVoid = false;

            data.forEach(record => {
                if (record.type === 'earn') {
                    hasEarn = true;
                }
                if (record.type === 'void') {
                    hasVoid = true;
                }
            });

            if (hasVoid) {
                response.status = false;
                response.errMsg = 'Cannot void an already voided transaction';
                response.statusCode = 200;
                reject(response);
            } else if (hasEarn) {
                let voidDb = {
                    invoice_num: data[0].invoice_num,
                    sender_id: data[0].receiver_id,
                    receiver_id: null,
                    type: 'void',
                    point_amount: data[0].point_amount,
                    comment: voidInput.comment,
                };

                let slipPayLoad = {
                    sender,
                    client: client,
                    transferInfo: voidInput,
                    invoiceNum: data[0].invoice_num,
                    point_amount: data[0].point_amount
                };

                const vPoint = "INSERT INTO point_transfer SET ?";

                sql.query(vPoint, [voidDb], (err, results, fields) => {
                    if (!err) {
                        if (results.affectedRows > 0) {
                            response.data = { message: 'Void successful' };
                            Flex.voidSlip(slipPayLoad);
                            resolve(response);
                        } else {
                            response.status = false;
                            response.errMsg = 'บันทึกไม่สำเร็จ';
                            resolve(response);
                        }
                    } else {
                        response.status = false;
                        response.errMsg = err;
                        reject(response);
                    }
                });
            } else {
                response.status = false;
                response.errMsg = 'Not earn';
                response.statusCode = 200;
                reject(response);
            }
        } catch (err) {
            response.status = false;
            response.errMsg = err.message || 'Error occurred';
            response.statusCode = 500;
            reject(response);
        }
    })
}

Transfer.getProfile = function (input) {
    return new Promise(async (resolve, reject) => {

        const user_id = input.user_id

        try {
            await getProfile(user_id)
                .then((result) => {
                    // console.log(result);
                    resolve(result)
                }).catch((err) => {
                    console.log(err);
                });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            reject(error)
        }
    })
}



function generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    return `INV-${day}${month}${year}-${randomDigits}`;
}

module.exports = Transfer