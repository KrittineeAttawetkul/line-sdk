const sql = require('../../configs/db');
const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getProfile } = require('../../utils/getLinePofile');
const Reward = require('./reward');

var Auth = function () {
    this.created_at = new Date();
};

Auth.Login = function (loginInput) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        const { username, password } = loginInput; // Extract username and password from loginInput
        const query = 'SELECT * FROM admin WHERE username = ?';

        try {
            sql.query(query, [username], (err, results, fields) => {
                if (err) {
                    console.log(err);
                    response.errMsg = err;
                    response.status = false;
                    response.statusCode = 500;
                    return reject(response);
                }

                if (results.length === 0) {
                    response.errMsg = 'ชื่อผู้ใช้ไม่ถูกต้อง';
                    response.status = false;
                    response.statusCode = 200;
                    return resolve(response);
                }

                const user = results[0]; // Get the user from query results

                // Compare password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        console.log(err);
                        response.errMsg = err;
                        response.status = false;
                        response.statusCode = 500;
                        return reject(response);
                    }

                    if (!isMatch) {
                        response.errMsg = 'รหัสผ่านไม่ถูกต้อง';
                        response.status = false;
                        response.statusCode = 200;
                        return resolve(response);
                    }

                    // Create JWT token
                    const token = jwt.sign(
                        { id: user.id, username: user.username },
                        process.env.JWT_SECRET,
                        // { expiresIn: process.env.JWT_EXPIRATION }
                    );

                    response.data = { token }; // Return the token in the response
                    return resolve(response);
                });
            });
        } catch (err) {
            response.errMsg = 'Internal server error';
            response.status = false;
            response.statusCode = 500;
            return reject(response);
        }
    });
};


//Middleware
Auth.verifyToken = function (req, res, next) {
    const response = {
        status: true,
        errMsg: '',
        data: [],
        statusCode: 200
    };

    const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the 'Authorization' header

    if (!token) {
        response.errMsg = 'Token is required';
        response.status = false;
        response.statusCode = 200;
        return res.status(200).json(response); // Send 401 response if token is missing
    }

    // Verify the token using jwt.verify
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            response.errMsg = 'Invalid token';
            response.status = false;
            response.statusCode = 200;
            return res.status(200).json(response); // Send 403 response if the token is invalid
        }

        req.user = decoded; // Attach decoded user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
};


Auth.rewardList = function (input) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        const { start, length, draw, search, order } = input;

        const searchValue = search?.value || '';
        // Construct dynamic search query for each column, using table alias 'rl' for reward_list columns
        const searchQuery = searchValue
            ? `
      WHERE (rl.reward_name LIKE ? 
          OR rl.reward_id LIKE ? 
          OR rl.reward_price LIKE ? 
          OR rl.reward_start LIKE ? 
          OR rl.reward_end LIKE ? 
          OR rl.is_active LIKE ?)
  `
            : '';

        // Construct search parameters for each field
        const searchParams = searchValue
            ? [
                `%${searchValue}%`, // reward_name
                `%${searchValue}%`, // reward_id
                `%${searchValue}%`, // reward_price
                `%${searchValue}%`, // reward_start
                `%${searchValue}%`, // reward_end
                `%${searchValue}%`  // is_active
            ]
            : [];

        // Handle order by column and direction
        const orderColumn = order?.[0]?.column || 0; // Default to 0 if no column is provided
        const orderDir = order?.[0]?.dir || 'asc'; // Default to 'asc' if no direction is provided
        const orderByColumn = ['reward_name', 'reward_id', 'reward_price', 'reward_start', 'reward_end', 'available_amount', 'is_active'][orderColumn] || 'reward_name';

        const totalQuery = `SELECT COUNT(*) AS total FROM reward_list rl${searchQuery}`;
        const mainQuery = `
            SELECT rl.*, 
                   (rl.reward_amount - COALESCE(SUM(CASE WHEN rh.reward_status IN ('n', 'y') THEN 1 ELSE 0 END), 0)) AS available_amount,
                   COALESCE(SUM(CASE WHEN rh.reward_status = 'c' THEN 1 ELSE 0 END), 0) AS canceled_amount,
                   CASE 
                       WHEN NOW() BETWEEN rl.reward_start AND rl.reward_end THEN 'Start'
                       WHEN NOW() < rl.reward_start THEN 'Not Start'
                       WHEN NOW() > rl.reward_end THEN 'End'
                       ELSE NULL
                   END AS reward_status_condition
            FROM reward_list rl
            LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
            ${searchQuery}
            GROUP BY rl.reward_id
            ORDER BY ${orderByColumn} ${orderDir} 
            LIMIT ?, ?
        `;

        const params = [...searchParams, parseInt(start, 10), parseInt(length, 10)];

        sql.query(totalQuery, searchParams, (err, totalResult) => {
            if (err) {
                console.error(err);
                response.status = false;
                response.errMsg = 'Error fetching total records';
                response.statusCode = 500;
                return reject(response);
            }

            const totalRecords = totalResult[0]?.total || 0;

            sql.query(mainQuery, params, (err, results) => {
                if (err) {
                    console.error(err);
                    response.status = false;
                    response.errMsg = 'Error fetching reward data';
                    response.statusCode = 500;
                    return reject(response);
                }

                resolve({
                    draw: parseInt(draw, 10),
                    recordsTotal: totalRecords,
                    recordsFiltered: totalRecords,
                    data: results,
                    statusCode: 200 // Ensure this is valid
                });
            });
        });
    });
};

Auth.rewardHistory = function (input) {
    return new Promise((resolve, reject) => {
        let response = {
            status: true,
            errMsg: '',
            data: [],
            statusCode: 200
        };

        const { start, length, draw, search, order } = input;

        const searchValue = search?.value || '';
        const searchQuery = searchValue ? `WHERE rl.reward_name LIKE ?` : '';
        const searchParams = searchValue ? [`%${searchValue}%`] : [];

        // Handle order by column and direction
        const orderColumn = order?.[0]?.column || 0; // Default to 0 if no column is provided
        const orderDir = order?.[0]?.dir || 'asc'; // Default to 'asc' if no direction is provided
        const orderByColumn = ['user_id', 'reward_id', 'invoice_num', 'reward_status', 'redeem_at'][orderColumn] || 'user_id';

        const totalQuery = `SELECT COUNT(*) AS total FROM reward_history`;
        const mainQuery = `
        SELECT rh.*, rl.* 
        FROM reward_history rh
        INNER JOIN reward_list rl ON rh.reward_id = rl.reward_id
        ${searchQuery}
        ORDER BY ${orderByColumn} ${orderDir}
        LIMIT ?, ?
    `;
        const params = [...searchParams, parseInt(start, 10), parseInt(length, 10)];

        sql.query(totalQuery, searchParams, (err, totalResult) => {
            if (err) {
                console.error(err);
                response.status = false;
                response.errMsg = 'Error fetching total records';
                response.statusCode = 500;
                return reject(response);
            }

            const totalRecords = totalResult[0]?.total || 0;

            sql.query(mainQuery, params, async (err, results) => {
                if (err) {
                    console.error(err);
                    response.status = false;
                    response.errMsg = 'Error fetching reward data';
                    response.statusCode = 500;
                    return reject(response);
                }

                try {
                    // Enrich results with user profiles
                    const enrichedResults = await Promise.all(
                        results.map(async (row) => {
                            const profile = await getProfile(row.user_id);
                            return { ...row, profile };
                        })
                    );

                    resolve({
                        draw: parseInt(draw, 10),
                        recordsTotal: totalRecords,
                        recordsFiltered: totalRecords,
                        data: enrichedResults,
                        statusCode: 200
                    });
                } catch (profileErr) {
                    console.error(profileErr);
                    response.status = false;
                    response.errMsg = 'Error fetching user profiles or reward data';
                    response.statusCode = 500;
                    return reject(response);
                }
            });
        });
    });
};

Auth.getRewardByReward_id = function (reward_id) {
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




module.exports = Auth;
