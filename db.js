const mysql = require('mysql2/promise')
const config = require('./config')

exports.execute = async (query, data = null) =>  {
    try {

        const connection = await mysql.createConnection(config);

        const [rows, fields] = await connection.execute(query, data && data)
        
        connection.end()

        return {rows, fields}
    }
    catch (e) {
        throw new Error(e)
    }
}
