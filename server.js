const express = require("express"),
    app = express(),
    bodyParser = require("body-parser");
const https = require('https');
const fs = require('fs');
var cors = require('cors');
const fileUpload = require('express-fileupload');

require('dotenv').config();

app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    })
    next();
})


app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/images', express.static('uploads'))
app.use('/images', express.static('assets'));

app.use(cors());

const port = 3998;
console.log(`Server running at ${port}`);



var routes = require("./app/routes/route");
app.use(express.json())

//---------------------prod---------------------
const { SSL_OPTION } = require('./utils/tsl')
https.createServer(SSL_OPTION, app).listen(port);

//---------------------local---------------------
const sql = require('./configs/db');
// app.listen(port);
// sql.connect((err) => {
//     if (err) {
//         //console.log('Error connecting to MySQL database = ', err)
//         return;
//     }
//     console.log('MySQL successfully connected ')
// })

// const PORT = 6000
// app.listen(PORT, () => //console.log(`Server is running on port ${PORT}`))

routes(app);
module.exports = app;
