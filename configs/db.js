const mysql = require('mysql');

let connection = new Object();
//MySQl connection
if(process.env.stage === 'dev'){
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        //MAMP ต้องใส่ BUT XAMPP ไม่ต้องใส่
        // password: 'root', 
        database: 'line_loyalty',
        port:'3306'
    })
}else if(process.env.stage === 'prod'){
    connection = mysql.createConnection({
        host: 'localhost',
        user: 'nilecon_hr',
        password: 'NnRr64o9s1', 
        database: 'nilecon_hr',
        port:'3306'
    })
}


module.exports = connection;