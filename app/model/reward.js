const sql = require('../../configs/db');
const fs = require('fs');
const savePicture = require('../../utils/addons');
const path = require('path')

var Reward = function () {
    this.created_at = new Date()
}

Reward.addReward = function (rewardInput, file) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        const reward_id = generateRewardId();
        rewardInput.reward_id = reward_id;
        let pathFile = path.join(__dirname, '../../uploads/reward_pictures');
        // rewardInput.reward_url = await savePicture(pathFile, file);

        try {
            // Date conversion for reward start and end
            if (rewardInput.reward_start) {
                rewardInput.reward_start = await convertToMySQLDate(rewardInput.reward_start)
                    .catch(err => reject({ status: false, errMsg: `Date conversion error for reward_start: ${err.message}` }));
            }

            if (rewardInput.reward_end) {
                rewardInput.reward_end = await convertToMySQLDate(rewardInput.reward_end)
                    .catch(err => reject({ status: false, errMsg: `Date conversion error for reward_end: ${err.message}` }));
            }

            const currentDate = new Date();

            // Check if reward_end is before the current date and time
            if (rewardInput.reward_end) {
                const endDate = new Date(rewardInput.reward_end);
                if (endDate < currentDate) {
                    return reject({
                        status: false,
                        // errMsg: 'reward_end cannot be before the current date and time'
                        errMsg: 'วันที่หมดอายุไม่สามารถเป็นก่อนวันเริ่มใช้งานและเวลาปัจจุบันได้'
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
                        // errMsg: 'reward_start cannot be after reward_end'
                        errMsg: 'วันเริ่มใช้งานไม่สามารถอยู่หลังวันที่หมดอายุได้'
                    });
                } else if (startDate.getTime() === endDate.getTime()) {
                    return reject({
                        status: false,
                        // errMsg: 'reward_start and reward_end cannot be at the same time'
                        errMsg: 'วันเริ่มใช้งานและวันที่หมดอายุไม่สามารถเป็นเวลาเดียวกันได้'
                    });
                }
            }

            // Check if reward_amount is 0 or less than 0
            if (!rewardInput.reward_amount || rewardInput.reward_amount <= 0) {
                return reject({
                    status: false,
                    // errMsg: 'reward_amount must be greater than 0'
                    errMsg: 'จำนวนรางวัลต้องมากกว่า 0'
                });
            }

            // Check if reward_price is lower than 0
            if (rewardInput.reward_price < 0) {
                return reject({
                    status: false,
                    // errMsg: 'reward_price cannot be lower than 0'
                    errMsg: 'ราคารางวัลไม่สามารถต่ำกว่า 0 ได้'
                });
            }

            rewardInput.reward_url = await savePicture(pathFile, file);

            const r = 'INSERT INTO reward_list SET ?';

            sql.query(r, rewardInput, (err, results) => {
                if (err) {
                    return reject({
                        status: false,
                        errMsg: `SQL error: ${err.message}`
                    });
                }

                if (results.affectedRows > 0) {
                    response.status = true;
                    response.data = 'Successfully saved record';
                    return resolve(response);
                } else {
                    return reject({
                        status: false,
                        errMsg: 'Failed to save record'
                    });
                }
            });
        } catch (err) {
            // Catch any unexpected errors
            return reject({
                status: false,
                errMsg: 'An unexpected error occurred: ' + err.message
            });
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
               (rl.reward_amount - COALESCE(COUNT(CASE WHEN rh.reward_status IN ('n', 'y') THEN rh.reward_id END), 0)) AS available_amount,
               COALESCE(COUNT(CASE WHEN rh.reward_status = 'c' THEN rh.reward_id END), 0) AS canceled_amount
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
                            "url": `${process.env.SERVER_BASE_API}/${product.reward_url}`
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "spacing": "sm",
                            "contents": [
                                {
                                    "type": "text",
                                    "text": `${product.reward_name}`,
                                    // "wrap": true,
                                    "weight": "bold",
                                    "size": "xl"
                                },
                                {
                                    "type": "text",
                                    "text": `${product.reward_price} Points`,
                                    // "wrap": true,
                                    "weight": "bold",
                                    "size": "lg"
                                },
                                {
                                    "type": "text",
                                    "text": `หมดอายุ ${thaiFormattedDate}`
                                },
                                {
                                    "type": "text",
                                    "text": `Available: ${product.available_amount} items`,
                                    "color": "#5A82E2",
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
                                        "type": "uri",
                                        "label": "Redeem Now!",
                                        "uri": `https://liff.line.me/2006140913-67Argbab?reward_id=${product.reward_id}`
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
                        "hero": {
                            "type": "image",
                            "size": "full",
                            "aspectRatio": "20:22",
                            "aspectMode": "cover",
                            "url": "https://fastly.picsum.photos/id/1060/200/300.jpg?hmac=xYtFmeYcfydIF3-Qybnra-tMwklX69T52EtGd-bacBI"
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "History",
                                        "uri": "https://liff.line.me/2006140913-Q8wg0XkX"
                                    },
                                    "style": "primary",
                                    "gravity": "center",
                                    "color": "#5A82E2"
                                }
                            ],
                            "justifyContent": "center"
                        }
                    });
                } else {
                    // Add both "See more" and "History" buttons if more than 3 available rewards
                    carouselContents.push({
                        "type": "bubble",
                        "size": "hecto",
                        "hero": {
                            "type": "image",
                            "size": "full",
                            "aspectRatio": "20:17",
                            "aspectMode": "cover",
                            "url": "https://fastly.picsum.photos/id/1060/200/300.jpg?hmac=xYtFmeYcfydIF3-Qybnra-tMwklX69T52EtGd-bacBI"
                        },
                        "body": {
                            "type": "box",
                            "layout": "vertical",
                            "contents": [
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "ประวัติการแลก",
                                        "uri": "https://liff.line.me/2006140913-Q8wg0XkX"
                                    },
                                    "style": "primary",
                                    "gravity": "center",
                                    "color": "#5A82E2"
                                },
                                {
                                    "type": "button",
                                    "action": {
                                        "type": "uri",
                                        "label": "รายการของรางวัล",
                                        "uri": "https://liff.line.me/2006140913-Wj0P9818"
                                    },
                                    "style": "secondary",
                                    "gravity": "center"
                                }
                            ],
                            "justifyContent": "center",
                            "spacing": "md"
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
                   (rl.reward_amount - IFNULL(COUNT(CASE WHEN rh.reward_status IN ('n', 'y') THEN 1 END), 0)) AS available_reward_amount
            FROM reward_list rl
            LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
            AND rh.reward_status IN ('n', 'y')  -- Only count 'n' and 'y' statuses
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
                            response.errMsg = 'This reward has not started yet'; // "This reward has not started yet"
                            // response.errMsg = 'รางวัลนี้ยังไม่เริ่ม'; // "This reward has not started yet"
                            response.statusCode = 200;
                            response.data = reward;
                            resolve(response);
                        } else if (currentDate > new Date(reward.reward_end)) {
                            response.status = false;
                            response.errMsg = 'This reward has expired'; // "This reward has expired"
                            // response.errMsg = 'รางวัลนี้หมดอายุแล้ว'; // "This reward has expired"
                            response.statusCode = 200;
                            response.data = reward;
                            resolve(response);
                        } else if (reward.available_reward_amount <= 0) {
                            response.status = false;
                            response.errMsg = 'Sorry, this reward is out of stock'; // "Sorry, this reward is out of stock"
                            // response.errMsg = 'ขออภัย รางวัลนี้หมดแล้ว'; // "Sorry, this reward is out of stock"
                            response.statusCode = 200;
                            response.data = reward;
                            resolve(response);
                        } else {
                            response.data = reward; // Return the reward data with available reward amount
                            resolve(response);
                        }
                    } else {
                        // Check if the reward is not found
                        response.status = false;
                        response.errMsg = 'Reward not found'; // "Reward not found"
                        // response.errMsg = 'ไม่พบรางวัลนี้'; // "Reward not found"
                        response.statusCode = 200;
                        resolve(response);
                    }
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

Reward.allReward = function (pageNo, itemPerPage) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        // Calculate the offset for pagination
        let offset = (pageNo - 1) * itemPerPage;

        let pageOffset = (pageNo * itemPerPage) - itemPerPage;


        const query = `
        SELECT rl.*, 
               (rl.reward_amount - COALESCE(COUNT(CASE WHEN rh.reward_status IN ('n', 'y') THEN rh.reward_id END), 0)) AS available_amount,
               COALESCE(COUNT(CASE WHEN rh.reward_status = 'c' THEN rh.reward_id END), 0) AS canceled_amount
        FROM reward_list rl
        LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
        WHERE rl.is_active = 1 
        AND rl.reward_amount > 0
        AND NOW() BETWEEN rl.reward_start AND rl.reward_end
        GROUP BY rl.reward_id
        HAVING available_amount > 0
        LIMIT ?, ?`;

        sql.query(query, [pageOffset, itemPerPage], (err, results) => {
            if (err) {
                console.error(err);
                response.status = false;
                response.errMsg = 'Error fetching rewards';
                response.statusCode = 500;
                return reject(response);
            }

            response.data = results; // Assign the filtered rewards directly
            resolve(response);
        });
    });
};

Reward.getRewardHistoryByUserId = function (user_id, pageNo, itemPerPage) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        let pageOffset = (pageNo * itemPerPage) - itemPerPage;

        const query = `
        SELECT rh.*, rl.*
        FROM reward_history rh
        INNER JOIN reward_list rl ON rh.reward_id = rl.reward_id
        WHERE rh.user_id = ?
        LIMIT ?, ?`;

        sql.query(query, [user_id, pageOffset, itemPerPage], (err, results) => {
            if (err) {
                console.error(err);
                response.status = false;
                response.errMsg = 'Error fetching rewards';
                response.statusCode = 500;
                return reject(response);
            }

            response.data = results; // Assign the rewards with details directly
            resolve(response);
        });
    });
};

Reward.updateForm = function (rewardInput, file) {
    return new Promise(async (resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: {},
            statusCode: 200
        };

        let pathFile = path.join(__dirname, '../../uploads/reward_pictures');

        // If a file is uploaded, save the picture and update the reward_url
        if (file) {
            rewardInput.reward_url = await savePicture(pathFile, file);
        }

        if (rewardInput.reward_start) {
            rewardInput.reward_start = await convertToMySQLDate(rewardInput.reward_start);
        }
        if (rewardInput.reward_end) {
            rewardInput.reward_end = await convertToMySQLDate(rewardInput.reward_end);
        }

        const startDate = new Date(rewardInput.reward_start);
        const endDate = new Date(rewardInput.reward_end);

        // Validate dates
        if (startDate >= endDate) {
            response = {
                status: false,
                // errMsg: 'Invalid reward dates provided.',
                errMsg: 'วันที่รางวัลไม่ถูกต้อง',
                statusCode: 200 // Bad Request
            };
            return reject(response);
        }

        // Validate amounts
        if (!rewardInput.reward_amount || rewardInput.reward_amount <= 0) {
            response = {
                status: false,
                // errMsg: 'reward_amount must be greater than 0',
                errMsg: 'จำนวนรางวัลต้องมากกว่า 0',
                statusCode: 200 // Bad Request
            };
            return reject(response);
        }

        if (rewardInput.reward_price === undefined || rewardInput.reward_price < 0) {
            response = {
                status: false,
                // errMsg: 'reward_price cannot be lower than 0',
                errMsg: 'ราคารางวัลไม่สามารถต่ำกว่า 0 ได้',
                statusCode: 200 // Bad Request
            };
            return reject(response);
        }

        // Prepare the SQL query to update the reward list in the database
        const updateQuery = `
            UPDATE reward_list 
            SET ?
            WHERE reward_id = ?
        `;

        // Execute the SQL query
        try {
            sql.query(updateQuery, [rewardInput, rewardInput.reward_id], (err, results) => {
                if (err) {
                    console.error(err);
                    response.status = false;
                    response.errMsg = 'Error updating reward';
                    response.statusCode = 500;
                    return reject(response);
                }

                // Check if the update was successful
                if (results.changedRows === 0) {
                    response.status = true;
                    response.data = 'ไม่มีการเปลี่ยนแปลง';
                    // response.data = 'No changes made because the provided values are identical to the existing values';
                    resolve(response);
                }
                else if (results.affectedRows > 0) {
                    response.status = true;
                    response.data = 'Reward updated successfully';
                    resolve(response);
                }
                else {
                    response.status = false;
                    response.errMsg = 'No reward found with the given ID';
                    response.statusCode = 404;
                    resolve(response);
                }
            });
        } catch (err) {
            // Handle any errors that occur during the database query
            response.status = false;
            response.errMsg = err.message;
            response.statusCode = 500;
            reject(response);
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


module.exports = Reward