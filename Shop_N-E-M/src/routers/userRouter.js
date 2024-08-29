import express from 'express'
import ctrl from '../controllers/userController.js'
const userRouter = express.Router()

userRouter.get('/', ctrl.getUserPage)
userRouter.get('/cart', ctrl.getCartPage)
userRouter.get('/add-to-cart/:id', ctrl.addToCart)
userRouter.post('/cart-update-quantity/:id', ctrl.cartUpdateQuantity)
userRouter.get('/delete-to-cart/:id', ctrl.deleteToCart)
userRouter.post('/update/:id', ctrl.updateUser)
userRouter.post('/delete/:id', ctrl.deleteUser)
userRouter.get('/security', ctrl.getSecurityPage)
userRouter.post('/security/change-password', ctrl.changePassword)

export default userRouter