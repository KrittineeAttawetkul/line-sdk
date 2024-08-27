const fs = require('fs');


const SSL_OPTION = {
    key: fs.readFileSync("./utils/private.key"), // Your private key
    cert: fs.readFileSync("./utils/fullchain.pem"), // Your server certificate
};

module.exports = {
    SSL_OPTION
};