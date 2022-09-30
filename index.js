const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors') 
require('dotenv').config()
const router = require('./router/index')
const errorMiddleware = require("./midlewares/error-middleware")

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use('/api', router)
app.use(errorMiddleware)

const start = () => {
    try {
        app.listen(PORT, () => console.log('Server started on port: ' + PORT))
    } catch (e) {
        console.error(e)
    }
}
start()