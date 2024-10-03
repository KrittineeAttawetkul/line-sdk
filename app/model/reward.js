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
            const [datePart, timePart] = dateStr.split(',');
            const [day, month, year] = datePart.split('-');

            let formattedDate = `${year}-${month}-${day}`;
            let formattedTime = timePart;

            // Handle the case for 24:00:00 time
            if (timePart === '24:00:00') {
                const dateObj = new Date(`${year}-${month}-${day}T00:00:00`);
                dateObj.setDate(dateObj.getDate() + 1);

                formattedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                formattedTime = '00:00:00'; // Reset time to 00:00:00
            }

            return `${formattedDate} ${formattedTime}`;
        }

        // Date conversion for reward start and end
        if (rewardInput.reward_start) {
            rewardInput.reward_start = convertToMySQLDate(rewardInput.reward_start);
        }

        if (rewardInput.reward_end) {
            rewardInput.reward_end = convertToMySQLDate(rewardInput.reward_end);
        }

        const currentDate = new Date();

        // Check if reward_end is before the current date and time
        if (rewardInput.reward_end) {
            const endDate = new Date(rewardInput.reward_end);
            if (endDate < currentDate) {
                return reject({
                    status: false,
                    errMsg: 'reward_end cannot be before the current date and time'
                });
            }
        }

        // Check if reward_start is after or at the same time as reward_end
        if (rewardInput.reward_start && rewardInput.reward_end) {
            const startDate = new Date(rewardInput.reward_start);
            const endDate = new Date(rewardInput.reward_end);

            if (startDate > endDate) {
                return reject({
                    status: false,
                    errMsg: 'reward_start cannot be after reward_end'
                });
            } else if (startDate.getTime() === endDate.getTime()) {
                return reject({
                    status: false,
                    errMsg: 'reward_start and reward_end cannot be at the same time'
                });
            }
        }

        // Check if reward_amount is 0 or less than 0
        if (!rewardInput.reward_amount || rewardInput.reward_amount <= 0) {
            return reject({
                status: false,
                errMsg: 'reward_amount must be greater than 0'
            });
        }

        // Check if reward_price is lower than 0
        if (rewardInput.reward_price < 0) {
            return reject({
                status: false,
                errMsg: 'reward_price cannot be lower than 0'
            });
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

        const s = `
        SELECT rl.*, 
               (rl.reward_amount - COALESCE(COUNT(rh.reward_id), 0)) AS available_amount
        FROM reward_list rl
        LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
        WHERE rl.is_active = 1 
        AND rl.reward_amount > 0
        AND NOW() BETWEEN rl.reward_start AND rl.reward_end
        GROUP BY rl.reward_id
        HAVING available_amount > 0
        `;

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
            const availableRewards = results.filter(product => product.available_amount > 0);

            // Show only the first 3 rewards
            const rewardsToShow = availableRewards.slice(0, 3);

            if (rewardsToShow.length > 0) {
                const carouselContents = rewardsToShow.map(product => {
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
                                },
                                {
                                    "type": "text",
                                    "text": `available ${product.available_amount}x`
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

                // Add button based on the number of available rewards
                if (availableRewards.length <= 3) {
                    // Add "History" button if 3 or fewer available rewards
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
                                        "label": "History",
                                        "text": "History"
                                    }
                                }
                            ]
                        }
                    });
                } else {
                    // Add both "See more" and "History" buttons if more than 3 available rewards
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
                                },
                                {
                                    "type": "button",
                                    "flex": 1,
                                    "gravity": "center",
                                    "action": {
                                        "type": "message",
                                        "label": "History",
                                        "text": "History"
                                    }
                                }
                            ]
                        }
                    });
                }

                message = {
                    type: "flex",
                    altText: "รายการของรางวัล",
                    contents: {
                        type: "carousel",
                        contents: carouselContents
                    }
                };
            } else {
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

        // SQL statement to get reward, count how many times it has been redeemed,
        // and check if it is within the start and end date
        const s = `
            SELECT rl.*, 
                   (rl.reward_amount - IFNULL(COUNT(rh.reward_id), 0)) AS available_reward_amount
            FROM reward_list rl
            LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
            WHERE rl.reward_id = ? 
            AND rl.is_active = 1
            GROUP BY rl.reward_id;
        `;

        try {
            sql.query(s, [reward_id], (err, results, fields) => {
                if (err) {
                    console.log(err);
                    response.errMsg = err;
                    response.status = false;
                    response.statusCode = 500;
                    reject(response);
                } else {
                    if (results.length > 0) {
                        const reward = results[0];
                        const currentDate = new Date();

                        // Check if the reward is valid based on date
                        if (currentDate < new Date(reward.reward_start)) {
                            response.status = false;
                            response.errMsg = 'รางวัลนี้ยังไม่เริ่ม'; // "This reward has not started yet"
                            response.statusCode = 400;
                            resolve(response);
                        } else if (currentDate > new Date(reward.reward_end)) {
                            response.status = false;
                            response.errMsg = 'รางวัลนี้หมดอายุแล้ว'; // "This reward has expired"
                            response.statusCode = 400;
                            resolve(response);
                        } else if (reward.available_reward_amount <= 0) {
                            response.status = false;
                            response.errMsg = 'ขออภัย รางวัลนี้หมดแล้ว'; // "Sorry, this reward is out of stock"
                            response.statusCode = 400;
                            resolve(response);
                        } else {
                            response.data = reward; // Return the reward data with available reward amount
                            resolve(response);
                        }
                    } else {
                        // Check if the reward is not found
                        response.status = false;
                        response.errMsg = 'ไม่พบรางวัลนี้'; // "Reward not found"
                        response.statusCode = 404;
                        resolve(response);
                    }
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};



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