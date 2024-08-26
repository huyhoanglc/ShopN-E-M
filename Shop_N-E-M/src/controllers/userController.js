import Users from '../models/userModel.js'
import bcrypt from 'bcryptjs'

const validateUser = async (email, phone) => {
    let errors = []

    const regexEmail = /^[a-z0-9]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/
    const regexPhone = /^0[9|8|1|7|3|5]([-. ]?[0-9]{7,9})$/

    if (email) {
        if (!regexEmail.test(email)) {
            errors.push('Email is invalid!')
        } else {
            const user = await Users.findOne({ email: email })
            if (user && user.email !== email) {
                errors.push('Email is already exists!')
            }
        }
    }

    if (phone) {
        if (!regexPhone.test(phone)) {
            errors.push('Phone is invalid!')
        } else {
            const checkPhone = await Users.exists({ phone: phone })
            if (checkPhone) {
                errors.push('Phone is already exists!')
            }
        }
    }

    return errors
}

class controllers {
    getUserPage = (req, res) => {
        const { userData } = req.body

        res.render('pages/user/User', {
            title: 'Information',
            user: userData,
            errors: []
        })
    }

    updateUser = async (req, res) => {
        const { id } = req.params
        const { userData, password, email, phone } = req.body

        if (id != userData._id) {
            res.render('pages/user/User', {
                title: 'Information',
                user: userData,
                errors: ["Can't update this account."]
            })
        }

        let errors = await validateUser(email, phone)

        if (errors.length > 0) {
            res.render('pages/user/User', {
                title: 'Information',
                user: userData,
                errors: errors
            })
        } else {
            const user = await Users.findById(id)
            const checkPassword = await bcrypt.compareSync(password, user.password)
            if (!checkPassword) {
                res.render('pages/user/User', {
                    title: 'Information',
                    user: userData,
                    errors: ["Invalid password."]
                })
            } else {
                await Users.findByIdAndUpdate(id, { email: email, phone: phone })
                res.redirect('/user')
            }
        }
    }

    deleteUser = async (req, res) => {
        const { id } = req.params
        const { userData, password } = req.body
        if (id != userData._id) {
            res.render('pages/user/User', {
                title: 'Information',
                user: userData,
                errors: ["Can't delete this account."]
            })
        }
        const user = await Users.findById(id)
        const checkPassword = await bcrypt.compareSync(password, user.password)
        if (!checkPassword) {
            res.render('pages/user/User', {
                title: 'Information',
                user: userData,
                errors: ["Invalid password."]
            })
        } else {
            await Users.findByIdAndDelete(id)
            res.redirect('/')
        }
    }
}

export default new controllers()