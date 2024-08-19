const fs = require('fs');

const SSL_OPTION = {
    key: fs.readFileSync("../../ssl/cert.pem"),
    cert: fs.readFileSync("/home/pods/domains/podsable.com/piyamin/api/ssl/podsable.com.crt"),
};

module.exports = {
    SSL_OPTION
};