const mysql = require('mysql2/promise');
require('dotenv').config()


const connection = mysql.createPool({
    host: 'localhost',
    port: 3306,
    
    user: 'henriqueadmin',
    password: 'henriqueadmin',
    database: 'cadastro'
});

module.exports = connection;