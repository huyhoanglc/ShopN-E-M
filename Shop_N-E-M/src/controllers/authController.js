import generateToken from '../config/jsonwebtoken.js'
import Users from '../models/userModel.js'
import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10)
const hashUserPassword = async (password) => {
    const hashPassword = await bcrypt.hashSync(password, salt)
    return hashPassword
}

const validateRegister = async (username, password, confirmPassword) => {
    let error = {}
    if (!username) {
        error.username = 'Username is required!'
    }
    if (username) {
        const checkUsername = await Users.exists({ username })
        if (checkUsername) {
            error.username = 'Username is exists!'
        }
    }
    if (!password) {
        error.password = 'Password is required!'
    }
    if (!confirmPassword) {
        error.confirmPassword = 'Confirm Password is required!'
    }
    if (confirmPassword !== password) {
        error.confirmPassword = 'Password and Confirm Password does not match!'
    }
    return error
}

const validateLogin = async (username, password) => {
    let error = {}
    if (!username) {
        error.username = 'Username is required!'
    }
    if (!password) {
        error.password = 'Password is required!'
    }
    if (username && password) {
        const user = await Users.findOne({ username })
        if (!user) {
            error.username = 'Username or Password is incorrect!'
            error.password = 'Username or Password is incorrect!'
        } else {
            const checkPassword = await bcrypt.compareSync(password, user.password)
            if (!checkPassword) {
                error.username = 'Username or Password is incorrect!'
                error.password = 'Username or Password is incorrect!'
            }
        }
    }
    return error
}

class controllers {
    getRegisterPage = (req, res) => {
        res.render('pages/auth/Register', {
            title: "Register",
            data: null,
            errors: null
        })
    }

    getLoginPage = (req, res) => {
        const registerSuccess = req.query.registerSuccess ? "Register successfully, please login to continue!" : ""
        res.render('pages/auth/Login', {
            title: "Login",
            data: null,
            errors: null,
            registerSuccess: registerSuccess
        })
    }

    userRegister = async (req, res) => {
        try {
            const { username, password, confirmPassword } = req.body
            const errors = await validateRegister(username, password, confirmPassword)
            if (Object.keys(errors).length > 0) {
                return res.render('pages/auth/Register', {
                    title: "Register",
                    data: req.body,
                    errors: errors
                })
            } else {
                const hashedPassword = await hashUserPassword(password)
                const newUser = new Users({ username, password: hashedPassword })
                await newUser.save()
                res.redirect('/auth/login?registerSuccess=true')
            }
        } catch (err) {
            console.error(err)
        }
    }

    userLogin = async (req, res) => {
        try {
            const { username, password } = req.body
            const errors = await validateLogin(username, password)
            if (Object.keys(errors).length > 0) {
                return res.render('pages/auth/Login', {
                    title: "Login",
                    data: req.body,
                    errors: errors,
                    registerSuccess: ""
                })
            } else {
                const user = await Users.findOne({ username })
                const token = await generateToken(user, '1d')
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/'
                })
                res.redirect('/')
            }
        } catch (err) {
            console.error(err)
        }
    }

    userLogout = (req, res) => {
        res.clearCookie("token")
        res.redirect('/')
    }
}

export default new controllers()