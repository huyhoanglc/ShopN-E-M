import express from 'express'
import { getHomePage } from '../controllers/basicController.js'
import authRouter from './authRouter.js'
import { redirectIfAuth, userPageRedirectIfNotAuth } from '../middlewares/authMiddleware.js'
import managementRouter from './managementRouter.js'
import userRouter from './userRouter.js'
import { managementMiddleware } from '../middlewares/managementMiddleware.js'
const rootRouter = express.Router()

rootRouter.get('/', getHomePage)
rootRouter.post('/', getHomePage);
rootRouter.use('/auth', redirectIfAuth, authRouter)
rootRouter.use('/management', managementMiddleware, managementRouter)
rootRouter.use('/user', userPageRedirectIfNotAuth, userRouter)

export default rootRouter