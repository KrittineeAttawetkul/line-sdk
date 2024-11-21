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
                    response.errMsg = 'Wrong username';
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
                        response.errMsg = 'Wrong password';
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


// Auth.rewardList = function () {
//     return new Promise((resolve, reject) => {
//         let response = {
//             status: true,
//             errMsg: '',
//             data: [],
//             statusCode: 200
//         };

//         const query = `
//         SELECT rl.*, 
//         (rl.reward_amount - COALESCE(COUNT(CASE WHEN rh.reward_status IN ('n', 'y') THEN rh.reward_id END), 0)) AS available_amount,
//         COALESCE(COUNT(CASE WHEN rh.reward_status = 'c' THEN rh.reward_id END), 0) AS canceled_amount,
//         CASE 
//             WHEN NOW() BETWEEN rl.reward_start AND rl.reward_end THEN 'Start'   -- Between start and end
//             WHEN NOW() < rl.reward_start THEN 'Not Start'                        -- Before start
//             WHEN NOW() > rl.reward_end THEN 'End'                               -- After end
//             ELSE NULL                                                            -- Shouldn't happen, but for safety
//         END AS reward_status_condition
//         FROM reward_list rl
//         LEFT JOIN reward_history rh ON rl.reward_id = rh.reward_id
//         GROUP BY rl.reward_id
//         `;
//         // LIMIT ?, ?;

//         sql.query(query, [], (err, results) => {
//             if (err) {
//                 console.error(err);
//                 response.status = false;
//                 response.errMsg = 'Error fetching rewards';
//                 response.statusCode = 500;
//                 return reject(response);
//             }

//             response.data = results; // Assign the filtered rewards directly
//             resolve(response);
//         });
//     });
// };

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
        const searchQuery = searchValue ? `WHERE reward_name LIKE ?` : '';
        const searchParams = searchValue ? [`%${searchValue}%`] : [];

        // Handle order by column and direction
        const orderColumn = order?.[0]?.column || 0; // Default to 0 if no column is provided
        const orderDir = order?.[0]?.dir || 'asc'; // Default to 'asc' if no direction is provided
        const orderByColumn = ['reward_name', 'reward_id', 'reward_price', 'reward_start', 'reward_end', 'available_amount', 'is_active'][orderColumn] || 'reward_name';

        const totalQuery = `SELECT COUNT(*) AS total FROM reward_list ${searchQuery}`;
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





module.exports = Auth;
