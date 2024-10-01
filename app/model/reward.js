const sql = require('../../configs/db');

var Reward = function () {
    this.created_at = new Date()
}

Reward.addReward = function (rewardInput) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        const reward_id = generateRewardId();
        rewardInput.reward_id = reward_id;

        // Helper function to convert date format from DD-MM-YYYY to YYYY-MM-DD
        function convertToMySQLDate(dateStr) {
            // Split the input string into date and time parts
            const [datePart, timePart] = dateStr.split(',');

            // Split the date part into day, month, and year
            const [day, month, year] = datePart.split('-');

            // Initialize the new date variables
            let formattedDate = `${year}-${month}-${day}`;
            let formattedTime = timePart;

            // Check if time is 24:00:00
            if (timePart === '24:00:00') {
                // Increment the day by 1
                const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
                dateObj.setDate(dateObj.getDate() + 1);

                // Update formattedDate to the new date
                formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                formattedTime = '00:00:00'; // Reset time to 00:00:00
            }

            // Combine formatted date and time into MySQL DATETIME format
            const mysqlDateTime = `${formattedDate} ${formattedTime}`;

            return mysqlDateTime;
        }

        if (rewardInput.reward_start) {
            rewardInput.reward_start = convertToMySQLDate(rewardInput.reward_start);
        }

        if (rewardInput.reward_end) {
            rewardInput.reward_end = convertToMySQLDate(rewardInput.reward_end);
        }

        // Check if reward_start is after reward_end including time
        if (rewardInput.reward_start && rewardInput.reward_end) {
            const startDate = new Date(rewardInput.reward_start);
            const endDate = new Date(rewardInput.reward_end);

            if (startDate > endDate) {
                return reject({
                    status: false,
                    errMsg: 'reward_start cannot be after reward_end'
                });
            }
        }

        const r = 'INSERT INTO reward_list SET ?';

        try {
            sql.query(r, rewardInput, (err, results) => {
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
        } catch (err) {
            reject(err);
        }
    });
};


Reward.rewardCarousel = function (userId, client) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        // Updated SQL query to select only active rewards
        const s = 'SELECT * FROM reward_list WHERE is_active = 1 LIMIT 3';

        try {
            const results = await new Promise((resolve, reject) => {
                sql.query(s, [], (err, results) => {
                    if (err) {
                        console.error("SQL Error: ", err);
                        return reject(err);
                    }
                    resolve(results);
                });
            });

            let message;
            if (results.length > 0) {
                const carouselContents = results.map(product => {

                    const sqlDate = product.reward_end;
                    const thaiFormattedDate = formatThaiDate(sqlDate);

                    return {
                        "type": "bubble",
                        "size": "hecto",
                        "hero": {
                            "type": "image",
                            "size": "full",
                            "aspectRatio": "20:13",
                            "aspectMode": "cover",
                            "url": `${product.reward_url}`
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${product.reward_price} Points ${product.reward_name}`,
                                    "wrap": true,
                                    "weight": "bold",
                                    "size": "xl"
                                },
                                {
                                    "type": "text",
                                    "text": `หมดอายุ ${thaiFormattedDate}`
                                }
                            ]
                        },
                        "footer": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "message",
                                        "label": "Redeem Now!",
                                        "text": "Redeemed"
                                    },
                                    "color": "#5A82E2",
                                    "style": "primary"
                                }
                            ]
                        }
                    };
                });

                // Add the "See more" button bubble at the end
                carouselContents.push({
                    "type": "bubble",
                    "size": "hecto",
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "spacing": "sm",
                        "contents": [
                            {
                                "type": "button",
                                "flex": 1,
                                "gravity": "center",
                                "action": {
                                    "type": "message",
                                    "label": "See more",
                                    "text": "See more"
                                }
                            }
                        ]
                    }
                });

                // The complete message object
                message = {
                    type: "flex",
                    altText: "รายการของรางวัล",
                    contents: {
                        type: "carousel",
                        contents: carouselContents
                    }
                };
            }
            else {
                // message = [
                //     {
                //         "type": "text",
                //         "text": "ไม่พบรายการของรางวัล"
                //     }
                // ];

                message = {
                    type: "flex",
                    altText: "ไม่พบรายการของรางวัล",
                    contents: {
                        "type": "bubble",
                        "size": "deca",
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": "ไม่พบรายการ",
                                    "weight": "bold",
                                    "size": "xxl",
                                    "margin": "md",
                                    "align": "center"
                                }
                            ]
                        },
                        "styles": {
                            "footer": {
                                "separator": true
                            }
                        }
                    }
                };
            }

            try {
                await client.pushMessage(userId, message);
                console.log('Message sent');
            } catch (err) {
                console.error('Failed to send message', err);
            }

        } catch (err) {
            reject({
                status: false,
                errMsg: err.message || "Error fetching data",
                statusCode: 500
            });
        }
    });
}

Reward.getRewardByReward_id = function (reward_id) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        // Updated SQL query to select only active rewards
        const s = 'SELECT * FROM reward_list WHERE reward_id = ? AND is_active = 1';

        try {
            sql.query(
                s,
                [reward_id], // parameter to search by reward_id
                // callback function
                (err, results, fields) => { // results is an array
                    if (err) {
                        console.log(err);
                        response.errMsg = err;
                        response.status = false;
                        response.statusCode = 500;
                        reject(response);
                    }
                    else {
                        if (results.length > 0) {
                            response["data"] = results[0]; // Convert to object
                        } else {
                            response.status = false;
                            response.errMsg = 'ไม่พบข้อมูลในระบบ'; // "No data found in the system"
                        }
                        resolve(response);
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}



function generateRewardId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);

    return `RW-${day}${month}${year}-${randomDigits}`;
}

function formatThaiDate(sqlDate) {
    const monthsThai = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const date = new Date(sqlDate);

    const day = date.getDate(); // Get the day
    const month = monthsThai[date.getMonth()]; // Get the month in Thai format
    const year = date.getFullYear() + 543; // Convert to Buddhist year

    return `${day} ${month} ${year}`;
}

module.exports = Reward