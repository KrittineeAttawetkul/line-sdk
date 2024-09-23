const sql = require('../../configs/db');
const { getProfile } = require('../../utils/getLinePofile');
const Transfer = require('../model/transfer');


var History = function () {
    this.created_at = new Date()
}

History.getHistoryByUserId = function (user_id, pageNo, itemPerPage) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };
        let limitAll = (pageNo.all * itemPerPage) - itemPerPage;
        let limitEarn = (pageNo.earn * itemPerPage) - itemPerPage;
        let limitBurn = (pageNo.burn * itemPerPage) - itemPerPage;

        const allHis = `
            SELECT *, CASE 
            WHEN receiver_id = ? THEN 'earn' 
            ELSE 'burn' 
            END AS point_type 
            FROM point_transfer 
            WHERE sender_id = ? OR receiver_id = ? 
            ORDER BY transfer_at DESC 
            LIMIT ?, ?`;

        const senderHis = `
            SELECT *, 'burn' AS point_type 
            FROM point_transfer 
            WHERE sender_id = ? 
            ORDER BY transfer_at DESC 
            LIMIT ?, ?`;

        const receiverHis = `
            SELECT *, 'earn' AS point_type 
            FROM point_transfer 
            WHERE receiver_id = ? 
            ORDER BY transfer_at DESC 
            LIMIT ?, ?`;

        try {
            // 
            let allHisValue = await querySelector(allHis, [user_id, user_id, user_id, limitAll, itemPerPage])
            let receiverHisValue = await querySelector(receiverHis, [user_id, limitEarn, itemPerPage])
            let senderHisValue = await querySelector(senderHis, [user_id, limitBurn, itemPerPage])

            let historyPayload = {
                all: allHisValue,
                earn: receiverHisValue,
                burn: senderHisValue
            }


            response["data"] = historyPayload;



            const processTransaction = async (transaction) => {
                if (transaction.point_type === 'earn') {
                    // console.log(`Earned from: ${transaction.sender_id}, Amount: ${transaction.point_amount}`);
                    if (transaction.sender_id != null) {
                        const profile = await getProfile(transaction.sender_id);
                        // console.log('earn profile', profile.displayName);
                        // console.log('earn profile', profile.pictureUrl);

                        // Add profile.pictureUrl to the transaction object
                        transaction.displayName = profile.displayName;
                        transaction.pictureUrl = profile.pictureUrl;
                    }
                    // else {
                    //     transaction.sender_pictureUrl = null;
                    // }
                } else if (transaction.point_type === 'burn') {
                    // console.log(`Burned to: ${transaction.receiver_id}, Amount: ${transaction.point_amount}`);
                    if (transaction.receiver_id != null) {
                        const profile = await getProfile(transaction.receiver_id);
                        // console.log('burn profile', profile.pictureUrl);

                        // Add profile.pictureUrl to the transaction object
                        transaction.displayName = profile.displayName;
                        transaction.pictureUrl = profile.pictureUrl;
                    }
                    // else {
                    //     // Add profile.pictureUrl to the transaction object
                    //     transaction.receiver_pictureUrl = null;
                    // }
                }
            };

            // Process all transactions in the 'all', 'earn', and 'burn' arrays
            await Promise.all([
                ...historyPayload.all.map(processTransaction),
                ...historyPayload.earn.map(processTransaction),
                ...historyPayload.burn.map(processTransaction)
            ]);

            // console.log(response.data);

            resolve(response);
        } catch (err) {
            console.log(err);

        }
    })
}

History.balanceRanking = function () {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        const query = 'SELECT user_id FROM lineprofile';

        try {
            sql.query(
                query,
                [], // Empty array for placeholders if needed
                async (err, results, fields) => {
                    if (err) {
                        console.log(err);
                        response.errMsg = err;
                        response.status = false;
                        response.statusCode = 500;
                        return reject(response);
                    }

                    if (results.length > 0) {
                        try {
                            // Fetch balances and display names for all users
                            const usersWithBalances = await Promise.all(
                                results.map(async (row) => {
                                    const userId = row.user_id;
                                    try {
                                        const [balance, profile] = await Promise.all([
                                            Transfer.getCardByUserId(userId), // Fetch balance
                                            getProfile(userId) // Fetch profile (for displayName)
                                        ]);
                                        return {
                                            userId,
                                            status:balance.status,
                                            balance:balance.data.balance,
                                            lv_name:balance.data.lv_name,
                                            displayName: profile.displayName // Add displayName to response
                                        };
                                    } catch (err) {
                                        console.log(`Error fetching data for user ${userId}:`, err);
                                        return { userId, balance: 0, displayName: 'Unknown' }; // Handle errors by returning default values
                                    }
                                })
                            );

                            // Sort users by balance (descending)
                            usersWithBalances.sort((a, b) => {
                                const balanceA = a.balance?.data?.balance || 0;
                                const balanceB = b.balance?.data?.balance || 0;
                                return balanceB - balanceA;
                            });

                            // Return only the top 5 users
                            response.data = usersWithBalances.slice(0, 5);

                            resolve(response);
                        } catch (err) {
                            console.log('Error processing balances:', err);
                            response.errMsg = 'Error processing balances';
                            response.status = false;
                            response.statusCode = 500;
                            reject(response);
                        }
                    } else {
                        response.errMsg = 'ไม่พบข้อมูลในระบบ';
                        response.statusCode = 404;
                        resolve(response);
                    }
                }
            );
        } catch (err) {
            console.log('SQL Query Error:', err);
            response.errMsg = err;
            response.status = false;
            response.statusCode = 500;
            reject(response);
        }
    });
};




function querySelector(sqlState, where = []) {
    return new Promise((resolve, reject) => {
        let data = null;
        sql.query(
            sqlState,
            [...where],
            (err, results, fields) => {
                if (err) {
                    console.log('Query Selector: ', err)
                    data = err;
                }
                else {
                    data /* รูปแบบที่ 2 */ = results; //ทำให้เป็๋น Obj
                }
                resolve(data)
            }
        )
    })
}

module.exports = History