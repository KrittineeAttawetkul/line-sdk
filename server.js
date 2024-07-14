const express = require("express"),
    app = express(),
    bodyParser = require("body-parser");
const https = require('https');
const fs = require('fs');
// const {SSL_OPTION} = require('../utils/option')
var cors = require('cors');
const fileUpload = require('express-fileupload');

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    })
    next();
})
    
port = 3000;

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images', express.static('uploads'))
app.use(cors());

app.listen(port); // local
// https.createServer(SSL_OPTION,app).listen(port); // prod
console.log(`Server running at ${port}`);

var routes = require("./app/routes/route");
routes(app);
