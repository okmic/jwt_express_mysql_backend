import ApiError from "./exceptions/api-error"
import mysql from 'mysql2/promise'
import config from './config'

export const execute = async (query: string, data: Array<any> | null = null) =>  {
    try {
        const connection = await mysql.createConnection(config)
        const [rows, fields]: any = await connection.execute(query, data && data)
        connection.end()
/*      console.log(rows) */
        return {rows, fields}
    }
    catch (e: any) {
     console.log(e)
        throw ApiError.ErrorDb()
    }
}
