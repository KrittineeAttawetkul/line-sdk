const sql = require('../../configs/db');
const { Client } = require('@line/bot-sdk');
const lineConfig = require('../../configs/lineConfig');
const client = new Client(lineConfig);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
                    response.errMsg = 'User not found';
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


module.exports = Auth;
