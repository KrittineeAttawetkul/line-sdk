const mysql = require('mysql');

//MySQl connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    //MAMP ต้องใส่ BUT XAMPP ไม่ต้องใส่
    // password: 'root', 
    database: 'line_loyalty',
    port:'3306'
})

module.exports = connection;