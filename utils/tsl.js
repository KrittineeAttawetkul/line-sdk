const fs = require('fs');

const SSL_OPTION = {
    key: fs.readFileSync("/home/pods/domains/podsable.com/piyamin/api/ssl/podsable.com.key"),
    cert: fs.readFileSync("/home/pods/domains/podsable.com/piyamin/api/ssl/podsable.com.crt"),
};

module.exports = {
    SSL_OPTION
};