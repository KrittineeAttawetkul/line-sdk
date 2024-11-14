const mysql = require('mysql');

let connection = new Object();
console.log('env = ', process.env.stage)

// const pool = mysql.createPool({
//     connectionLimit: 10, // Set the limit based on your needs
//     host: 'localhost',
//     user: 'root',
//     password: 'password',
//     database: 'your_database'
// });

//MySQl connection
if (process.env.stage === 'dev') {
    connection = mysql.createConnection({
        host: process.env.DB_LOCAL_HOST,
        user: process.env.DB_LOCAL_USER,
        database: process.env.DB_LOCAL_NAME,
        port: process.env.DB_LOCAL_PORT
        //MAMP ต้องใส่ BUT XAMPP ไม่ต้องใส่
        // password: process.env.DB_LOCAL_PASSWORD, 
    })
}
else if (process.env.stage === 'prod') {

    connection = mysql.createPool({
        connectionLimit: 10, // Set the limit based on your needs
        host: process.env.DB_SERVER_HOST,
        user: process.env.DB_SERVER_USER,
        password: process.env.DB_SERVER_PASSWORD,
        database: process.env.DB_SERVER_NAME,
    })
}
else if (process.env.stage === 'render') {

    connection = mysql.createPool({
        connectionLimit: 10, // Set the limit based on your needs
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        port: process.env.port
    })
}


module.exports = connection;