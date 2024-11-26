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

                            if (RedeemInput.point_amount >= 0) {

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
                                console.log('point amount < 0');
                                response.status = false;
                                response.errMsg = 'Point amount cannot be lower than 0';
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

Transfer.earnRedeem = function (redeemInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        }

        try {
            console.log('redeemInput.invoice_num', redeemInput.invoice_num);

            const result = await Transfer.getDataByInvoiceNum(redeemInput.invoice_num);
            let data = result.data;
            console.log('earnRedeem Data', data);

            const receiver = await getProfile(data[0].sender_id);

            let hasRedeem = false;
            let hasEarn = false;

            data.forEach(record => {
                if (record.type === 'redeem') {
                    hasRedeem = true;
                }
                if (record.type === 'earn') {
                    hasEarn = true;
                }
            });

            if (hasEarn) {
                response.status = false;
                response.errMsg = 'Cannot earn an already earn transaction';
                response.statusCode = 200;
                reject(response);
            } else if (hasRedeem) {
                let earnDb = {
                    invoice_num: data[0].invoice_num,
                    sender_id: null,
                    receiver_id: data[0].sender_id,
                    type: 'earn',
                    point_amount: data[0].point_amount,
                    comment: `ยกเลิกการแลกของรางวัล : ${data[0].reward_name}`,
                };

                let slipPayLoad = {
                    receiver,
                    client: client,
                    transferInfo: redeemInput,
                    invoiceNum: data[0].invoice_num,
                    point_amount: data[0].point_amount,
                    comment: `ยกเลิกการแลกของรางวัล : ${data[0].reward_name}`,
                };

                const ePoint = "INSERT INTO point_transfer SET ?";

                sql.query(ePoint, [earnDb], (err, results, fields) => {
                    if (!err) {
                        if (results.affectedRows > 0) {
                            response.data = { message: 'Earn Redeem successful' };
                            Flex.earnSlip(slipPayLoad);
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

Reward.updateReward = function (rewardInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        const currentDate = new Date();
        const { tableName, updateFields, whereClause } = rewardInput;

        // Validate input
        if (!tableName || !updateFields || !whereClause) {
            response = {
                status: false,
                errMsg: 'Invalid input. Table name, update fields, and where clause are required.',
                statusCode: 400 // Bad Request
            };
            return reject(response); // reject here
        }

        try {
            // Logic for reward_list table
            if (tableName === 'reward_list') {
                if (updateFields.reward_start) {
                    updateFields.reward_start = await convertToMySQLDate(updateFields.reward_start);
                }
                if (updateFields.reward_end) {
                    updateFields.reward_end = await convertToMySQLDate(updateFields.reward_end);
                }

                const startDate = new Date(updateFields.reward_start);
                const endDate = new Date(updateFields.reward_end);

                // Validate dates
                // if (endDate < currentDate || startDate >= endDate) {
                //     response = {
                //         status: false,
                //         errMsg: 'Invalid reward dates provided.',
                //         statusCode: 400 // Bad Request
                //     };
                //     return reject(response); // reject here
                // }
                if (startDate >= endDate) {
                    response = {
                        status: false,
                        errMsg: 'Invalid reward dates provided.',
                        statusCode: 400 // Bad Request
                    };
                    return reject(response); // reject here
                }

                // Validate amounts
                if (!updateFields.reward_amount || updateFields.reward_amount <= 0) {
                    response = {
                        status: false,
                        errMsg: 'reward_amount must be greater than 0',
                        statusCode: 400 // Bad Request
                    };
                    return reject(response); // reject here
                }

                if (updateFields.reward_price === undefined || updateFields.reward_price < 0) {
                    response = {
                        status: false,
                        errMsg: 'reward_price cannot be lower than 0',
                        statusCode: 400 // Bad Request
                    };
                    return reject(response); // reject here
                }
            }

            // Logic for reward_history table
            if (tableName === 'reward_history') {
                if (updateFields.reward_status === 'c') {
                    try {
                        const currentStatusResults = await new Promise((resolve, reject) => {
                            const currentStatusQuery = `SELECT * FROM ?? WHERE ?? = ? AND ?? = ?`;
                            sql.query(currentStatusQuery, [tableName, 'reward_id', whereClause.reward_id, 'invoice_num', whereClause.invoice_num], (err, results) => {
                                if (err) reject(err); // reject here
                                resolve(results); // resolve here
                            });
                        });

                        if (currentStatusResults.length > 0 && currentStatusResults[0].reward_status !== 'c') {
                            const payload = {
                                invoice_num: currentStatusResults[0].invoice_num
                            };

                            await Transfer.earnRedeem(payload);
                        }
                    } catch (error) {
                        console.error("Error fetching current status:", error);
                        return reject({ status: false, errMsg: error.message, statusCode: 500 }); // reject with appropriate error message
                    }
                }
            }

            // Function to perform the update operation
            const performUpdate = async () => {
                const updateQuery = `UPDATE ?? SET ? WHERE ${Object.keys(whereClause).map((key) => `${key} = ?`).join(' AND ')}`;
                const whereValues = Object.values(whereClause); // Getting values for the where clause

                return new Promise((resolve, reject) => {
                    sql.query(updateQuery, [tableName, updateFields, ...whereValues], (err, results) => {
                        if (err) return reject(err); // handle rejection here
                        resolve(results); // resolve here
                    });
                });
            };

            // Call performUpdate to execute the update
            const results = await performUpdate();

            if (results.affectedRows === 0) {
                response = {
                    status: false,
                    errMsg: 'No row found with the specified reward_id or invoice_num',
                    statusCode: 404 // Not Found
                };
                return reject(response); // reject here
            } else if (results.changedRows === 0) {
                response = {
                    status: false,
                    errMsg: 'No changes made because the provided values are identical to the existing values',
                    statusCode: 200 // No Content
                };
                return reject(response); // reject here
            } else {
                response.data = results;
                console.log('update Complete');
                return resolve(response); // return the response
            }

        } catch (error) {
            console.error("Error:", error);
            return reject({ status: false, errMsg: error.message, statusCode: 500 }); // reject on any error
        }
    });
};



Transfer.getDataByInvoiceNum = function (invoice_num) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        // Combined SQL query with condition for 'redeem' type
        const s = `
        SELECT pt.*, 
                   rh.reward_id, 
                   rl.reward_name
        FROM point_transfer pt
            LEFT JOIN reward_history rh 
                ON pt.invoice_num = rh.invoice_num 
                AND pt.type = 'redeem'
            LEFT JOIN reward_list rl 
                ON rh.reward_id = rl.reward_id 
                AND pt.type = 'redeem'  -- Ensure the join happens only for 'redeem' type
        WHERE pt.invoice_num = ? 
        AND (pt.type = 'earn' OR pt.type = 'redeem' OR pt.type = 'void')
    `;

        try {
            sql.query(
                s,
                [invoice_num], // Parameter for search
                (err, results, fields) => {
                    if (err) {
                        console.log(err);
                        response.errMsg = err;
                        response.status = false;
                        response.statusCode = 500;
                        reject(response);
                    } else {
                        if (results.length > 0) {
                            // Process results
                            response.data = results;
                        } else {
                            response.status = false;
                            response.errMsg = 'ไม่พบข้อมูลในระบบ';
                        }
                        resolve(response);
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};


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

// Helper function to convert date format from DD-MM-YYYY to YYYY-MM-DD with date and time validation
function convertToMySQLDate(dateStr) {
    return new Promise((resolve, reject) => {
        // Check if dateStr is in the expected format
        if (!dateStr.includes(',')) {
            return reject({
                status: false,
                errMsg: 'Invalid date format. Expected format is DD-MM-YYYY,HH:MM:SS'
            });
        }

        const [datePart, timePart] = dateStr.split(',');
        const [day, month, year] = datePart.split('-');
        const [hours, minutes, seconds] = timePart.split(':');

        // Validate that day, month, year, hours, minutes, and seconds are numbers
        if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return reject({
                status: false,
                errMsg: 'Invalid date or time component.'
            });
        }

        // Convert to integers
        const dayInt = parseInt(day);
        const monthInt = parseInt(month);
        const yearInt = parseInt(year);
        const hoursInt = parseInt(hours);
        const minutesInt = parseInt(minutes);
        const secondsInt = parseInt(seconds);

        // Validate time: hours must be 0-23, minutes and seconds 0-59
        if (hoursInt < 0 || hoursInt > 23 || minutesInt < 0 || minutesInt > 59 || secondsInt < 0 || secondsInt > 59) {
            return reject({
                status: false,
                errMsg: 'Invalid time format. Expected time format is HH:MM:SS where hours are 0-23, minutes and seconds 0-59.'
            });
        }

        // Validate month (1-12)
        if (monthInt < 1 || monthInt > 12) {
            return reject({
                status: false,
                errMsg: 'Invalid month. Expected month between 01 and 12.'
            });
        }

        // Validate day range depending on the month and leap year
        const daysInMonth = new Date(yearInt, monthInt, 0).getDate(); // Get number of days in the month
        if (dayInt < 1 || dayInt > daysInMonth) {
            return reject({
                status: false,
                errMsg: `Invalid day. ${monthInt}-${yearInt} only has ${daysInMonth} days.`
            });
        }

        let formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let formattedTime = timePart;

        // Handle the case for 24:00:00 time
        if (timePart === '24:00:00') {
            const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
            dateObj.setDate(dateObj.getDate() + 1);

            formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            formattedTime = '00:00:00'; // Reset time to 00:00:00
        }

        resolve(`${formattedDate} ${formattedTime}`);
    });
}

module.exports = Transfer