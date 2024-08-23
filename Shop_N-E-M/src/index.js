import express from 'express'
import cookieParser from 'cookie-parser'
import connectDB from './config/connectDB.js'
import bodyParser from 'body-parser'
import rootRouter from './routers/rootRouter.js'
import {authMiddleware} from './middlewares/authMiddleware.js'
import expressLayouts from 'express-ejs-layouts'
require('dotenv').config()

const START_APP = () => {
    const app = express()
    const port = process.env.PORT || 6969

    app.use(cookieParser())
    app.use(express.static("public"))
    app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({ extended: true }))
    app.use(expressLayouts)
    app.set("layout", "layouts/main")
    app.set("view engine", "ejs")
    app.set("views", "src/views")

    app.listen(port, () => {
        console.log(`App is running on: http://localhost:${port}`)
        console.log('-------------------------------')
    })
    
    app.use(authMiddleware)
    app.use(rootRouter)
}

connectDB().then(() => {
    console.log('Connected to MongoDB')
    console.log('-------------------------------')
}).then(() => {
    START_APP()
}).catch(err => {
    console.error('Error connecting to MongoDB:', err)
    process.exit(1)
})