import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors' 
import dotenv from "dotenv"
import router from './router/auth.route'
import errorMiddleware from "./midlewares/error-middleware"
import swagger from "swagger-ui-express"
import * as swaggerDoc from "./swagger/authapi.json"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}))
app.use('/api', router)
app.use('/api-docs', swagger.serve, swagger.setup(swaggerDoc))
app.use(errorMiddleware)

const start = () => {
    try {
        app.listen(PORT, () => console.log('Server started on port: ' + PORT))
    } catch (e) {
        console.error(e)
    }
}

start()