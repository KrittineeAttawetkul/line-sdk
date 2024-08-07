const express = require("express"),
    app = express(),
    bodyParser = require("body-parser");
const https = require('https');
const fs = require('fs');
// const {SSL_OPTION} = require('./utils/tsl')
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

const port = 3998;

app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static('uploads'))
app.use('/images', express.static('eSlip_images'));
app.use('/images', express.static('pointCard_images'));

app.use(cors());

app.listen(port); // local
// https.createServer(SSL_OPTION, app).listen(port); // prod
console.log(`Server running at ${port}`);

var routes = require("./app/routes/route");



app.use(express.json())
const sql = require('./configs/db');

sql.connect((err) => {
    if (err) {
        //console.log('Error connecting to MySQL database = ', err)
        return;
    }
    console.log('MySQL successfully connected ')
})

// const PORT = 6000
// app.listen(PORT, () => //console.log(`Server is running on port ${PORT}`))

routes(app);
module.exports = app;
