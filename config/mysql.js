const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'boot'
})

connection.connect( err => {
    if (err) {
        console.log('Error de la conexión con la base de datos', err)
        return
    }
    console.log('Conexion Exitosa')
})

module.exports = connection;