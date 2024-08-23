import express from 'express'
import ctrl from '../controllers/authController.js'
const authRouter = express.Router()

authRouter.get('/register', ctrl.getRegisterPage)
authRouter.get('/login', ctrl.getLoginPage)
authRouter.post('/register', ctrl.userRegister)
authRouter.post('/login', ctrl.userLogin)
authRouter.get('/logout', ctrl.userLogout)

export default authRouter