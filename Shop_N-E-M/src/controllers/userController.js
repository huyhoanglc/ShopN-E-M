import Users from '../models/userModel.js'
import Carts from '../models/cartModel.js'
import Products from '../models/productModel.js'
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
            const user = await Users.findOne({ phone: phone })
            if (user && user.phone !== phone) {
                errors.push('Phone is already exists!')
            }
        }
    }

    return errors
}

const totalPrice = (cart) => {
    let total = 0
    if (cart.products && cart.products.length > 0) {
        for (let i = 0; i < cart.products.length; i++) {
            total += cart.products[i].quantity * cart.products[i].price
        }
    }
    return total
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

    // Cart
    getCartPage = async (req, res) => {
        const { userData } = req.body

        const cart = await Carts.findOne({ userId: userData._id })

        if (!cart) {
            const newCart = new Carts({
                userId: userData._id,
                products: []
            })
            await newCart.save()

            res.render('pages/user/Cart', {
                title: 'Shopping Cart',
                products: newCart.products,
                totalPrice: totalPrice(newCart)
            })
        } else {
            res.render('pages/user/Cart', {
                title: 'Shopping Cart',
                products: cart.products,
                totalPrice: totalPrice(cart)
            })
        }
    }

    addToCart = async (req, res) => {
        const { id } = req.params
        const { userData } = req.body
        const userId = userData._id

        const findProduct = await Products.findById(id)

        const product = {
            id: id,
            name: findProduct.name,
            price: findProduct.price,
            image: findProduct.image,
            quantity: 1
        }

        const checkCart = await Carts.findOne({ userId: userId })

        if (!checkCart) {
            const newCart = new Carts({
                userId: userId,
                products: [product]
            })
            await newCart.save()
        } else {
            const products = checkCart.products
            let isExists = false
            products.map((product) => {
                if (product.id === id) {
                    isExists = true
                    product.quantity += 1
                }
            })
            if (!isExists) {
                products.push(product)
            }
            await Carts.findByIdAndUpdate(checkCart._id, { products: products })
        }

        res.redirect(`/product/${id}`)
    }

    deleteToCart = async (req, res) => {
        const id = req.params.id
        const { userData } = req.body
        const userId = userData._id

        const cart = await Carts.findOne({ userId: userId })
        const products = cart.products.filter(product => product.id != id)

        await Carts.findByIdAndUpdate(cart._id, { products: products }, { new: true })

        res.redirect("/user/cart")
    }

    cartUpdateQuantity = async (req, res) => {
        const id = req.params.id
        const { userData } = req.body
        const userId = userData._id
        const quantity = parseInt(req.body.quantity)
        const cart = await Carts.findOne({ userId: userId })

        if (!quantity || quantity < 0) {
            res.redirect("/user/cart")
        } else {
            const products = cart.products.map(product => {
                if (product.id === id) {
                    product.quantity = quantity
                }
                return product
            })

            await Carts.findByIdAndUpdate(cart._id, { products: products }, { new: true })

            res.redirect("/user/cart")
        }
    }

    // Security
    getSecurityPage = async (req, res) => {
        const { userData } = req.body
        res.render("pages/user/Security", {
            title: "Security",
            errors: ""
        })
    }

    changePassword = async (req, res) => {
        const { userData } = req.body
        const user = await Users.findById(userData._id)
        const { password, newPassword, confirmNewPassword } = req.body

        let errors

        if (!password || !newPassword || !confirmNewPassword) {
            errors = "All fields are required."
        } else {
            const checkPassword = await bcrypt.compareSync(password, user.password)

            if (!checkPassword) {
                errors = "Invalid password."

            } else {
                if (newPassword !== confirmNewPassword) {
                    errors = "Passwords do not match."

                } else {
                    const hashedPassword = await bcrypt.hash(newPassword, 10)
                    await Users.findByIdAndUpdate(userData._id, { password: hashedPassword })

                }
            }
        }

        if (errors) {
            res.render("pages/user/Security", {
                title: "Security",
                errors: errors
            })
        } else {
            res.redirect("/user")
        }
    }
}

export default new controllers()