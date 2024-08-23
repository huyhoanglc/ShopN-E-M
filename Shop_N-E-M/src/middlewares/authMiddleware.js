import jwt from 'jsonwebtoken'
import generateToken from '../config/jsonwebtoken.js'
import Users from '../models/userModel.js'

export const authMiddleware = (req, res, next) => {
    try {
        const originalRender = res.render
        const token = req.cookies.token
        if (token) {
            jwt.verify(token, process.env.TOKEN_SECRET, async (err, token) => {
                if (!err) {     // verify success
                    const { userId, exp } = token

                    if (exp * 1000 < Date.now() + 30 * 60 * 1000) {
                        const user = await Users.findOne({ _id: userId })
                        const token = await generateToken(user, '1d')
                        res.cookie("token", token, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 1000,
                            path: '/'
                        })
                    }

                    const userData = await Users.findOne({ _id: userId }).select("username role")
                    req.body.userData = userData

                    res.render = function (view, options = {}, callback) {
                        options.userData = userData || null
                        return originalRender.call(this, view, options, callback)
                    }

                    next()
                } else {
                    res.clearCookie("token")
                    next()
                }
            })
        } else {
            res.render = function (view, options = {}, callback) {
                options.userData = null
                return originalRender.call(this, view, options, callback)
            }
            next()
        }
    } catch (err) {
        res.clearCookie("token")
        res.redirect('/')
    }
}

export const redirectIfAuth = (req, res, next) => {
    if (req.originalUrl === '/auth/logout') {
        next()
    } else if (req.body.userData) {
        res.redirect('/')
    } else {
        next()
    }
}