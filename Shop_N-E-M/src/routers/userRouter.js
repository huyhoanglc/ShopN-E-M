import express from 'express'
import ctrl from '../controllers/userController.js'
const userRouter = express.Router()

userRouter.get('/', ctrl.getUserPage)
userRouter.post('/update/:id', ctrl.updateUser)
userRouter.post('/delete/:id', ctrl.deleteUser)

export default userRouter