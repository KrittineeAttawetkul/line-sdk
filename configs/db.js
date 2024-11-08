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
        host: 'localhost',
        user: 'root',
        //MAMP ต้องใส่ BUT XAMPP ไม่ต้องใส่
        // password: 'root', 
        database: 'line_loyalty',
        port: '3306'
    })
}
else if (process.env.stage === 'render') {
    console.log("host :", process.env.host);
    console.log("user :", process.env.user);
    console.log("password :", process.env.password);
    console.log("database :", process.env.database);

    connection = mysql.createPool({
        connectionLimit: 10, // Set the limit based on your needs
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        // port: '3306'
    })
}
else if (process.env.stage === 'prod') {
    console.log("host :", process.env.host);
    console.log("user :", process.env.user);
    console.log("password :", process.env.password);
    console.log("database :", process.env.database);

    connection = mysql.createPool({
        connectionLimit: 10, // Set the limit based on your needs
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        // port: '3306'
    })
}


module.exports = connection;