const sql = require('../../configs/db');
const { getProfile } = require('../../utils/getLinePofile');


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