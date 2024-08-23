import Users from '../models/userModel.js'

export const managementMiddleware = async (req, res, next) => {
    try {
        const userData = req.body.userData
        const checkAdmin = await Users.exists({ _id: userData._id, role: 'admin' })
        if (!checkAdmin) {
            return res.redirect('/')
        }

        const originalRender = res.render
        res.render = function (view, options = {}, callback) {
            options.layout = "layouts/managementLayout"
            options.path = req.originalUrl
            return originalRender.call(this, view, options, callback)
        }
        next()
    } catch (err) {
        res.redirect('/')
    }
}