import fs from 'fs'
import Users from '../models/userModel.js'
import Products from '../models/productModel.js'
import Brands from '../models/brandModel.js'
import Categorys from '../models/categoryModel.js'

const validateUpdateUser = async (role) => {
    let error = []

    if (!role) {
        error.push('- Role is required!')
    }

    return error
}

const checkImage = (fileName) => {
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif']
    const extension = fileName.split('.').pop().toLowerCase()
    return validImageExtensions.includes(extension)
}

class controllers {
    // General
    getManagementPage = (req, res) => {
        res.render('pages/management/Management', {
            title: 'Management'
        })
    }

    // Account
    getAccountManagementPage = async (req, res) => {
        const perPage = 10
        const page = parseInt(req.query.page) || 1

        const users = await Users.aggregate(
            [
                {
                    $skip: (page - 1) * perPage
                },
                {
                    $limit: perPage
                },
                { $sort: { name: 1 } },

            ]
        )

        const count = await Users.countDocuments()

        res.render('pages/management/Account', {
            title: 'Account Management',
            users: users,
            searchValue: "",
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getSearchAccountManagementPage = async (req, res) => {
        const perPage = 10
        const page = parseInt(req.query.page) || 1

        const { searchValue } = req.body

        const users = await Users.find({
            username: { $regex: searchValue, $options: 'i' }
        }).select('username role')
            .sort({ role: 1, createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec()

        const count = await Users.countDocuments()

        res.render('pages/management/Account', {
            title: 'Account Management',
            users: users,
            searchValue: searchValue,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getDetailAccountManagementPage = async (req, res) => {
        const { id } = req.params
        const user = await Users.findById(id).select('username role email phone createdAt updatedAt')
        res.render('pages/management/AccountDetail', {
            title: 'Detail Account',
            user: user,
            errors: null
        })
    }

    deleteAccountManagement = async (req, res) => {
        const { id } = req.params
        await Users.findByIdAndDelete(id)
        res.redirect('/management/account')
    }

    userUpdateManagement = async (req, res) => {
        const { id } = req.params
        const { role, email, phone, username, createdAt, updatedAt } = req.body
        const errors = await validateUpdateUser(role)
        if (errors.length > 0) {
            res.render('pages/management/AccountDetail', {
                title: 'Detail Account',
                user: {
                    _id: id,
                    username: username,
                    role: role,
                    email: email,
                    phone: phone,
                    createdAt: createdAt,
                    updatedAt: updatedAt
                },
                errors: errors
            })
        } else {
            await Users.findByIdAndUpdate(id, { role })
            res.redirect('/management/account')
        }
    }

    // Brand
    getBrandManagementPage = async (req, res) => {
        const perPage = 10
        const page = parseInt(req.query.page) || 1
        const brands = await Brands.aggregate(
            [
                {
                    $skip: (page - 1) * perPage
                },
                {
                    $limit: perPage
                },
                { $sort: { name: 1 } },

            ]
        )

        await Promise.all(
            brands.map(async (brand) => {
                brand.totalProducts = await Products.countDocuments({ brand: brand._id })
            })
        )

        const count = await Brands.countDocuments()
        res.render('pages/management/Brand', {
            title: 'Brand Management',
            brands: brands,
            searchValue: null,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getSearchBrandManagementPage = async (req, res) => {
        const { searchValue } = req.body
        const perPage = 10
        const page = parseInt(req.query.page) || 1

        const brands = await Brands.find({
            name: { $regex: searchValue, $options: 'i' }
        }).sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec()

        await Promise.all(
            brands.map(async (brand) => {
                brand.totalProducts = await Products.countDocuments({ brand: brand._id })
            })
        )

        const count = await Brands.countDocuments()

        res.render('pages/management/Brand', {
            title: 'Brand Management',
            brands: brands,
            searchValue: searchValue,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getCreateBrandPage = (req, res) => {
        res.render('pages/management/BrandCreate', {
            title: 'Create Brand',
            data: null,
            errors: null
        })
    }

    createBrand = async (req, res) => {
        try {
            const { name } = req.body
            if (!name || name.trim() === '') {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/BrandCreate', {
                    title: 'Create Brand',
                    data: {
                        name: name
                    },
                    errors: 'Name is required!'
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/BrandCreate', {
                            title: 'Create Brand',
                            data: {
                                name: name
                            },
                            errors: 'Image size should not exceed 5MB'
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/BrandCreate', {
                            title: 'Create Brand',
                            data: {
                                name: name
                            },
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.'
                        })
                    } else {
                        const brand = new Brands({
                            name: name,
                            image: filename
                        })
                        await brand.save()
                        res.redirect('/management/brand')
                    }
                } else {
                    res.render('pages/management/BrandCreate', {
                        title: 'Create Brand',
                        data: {
                            name: name
                        },
                        errors: 'Image is required!'
                    })
                }
            }
        } catch (err) {
            console.log(err)
            res.redirect('/')
        }
    }



    getBrandDetailManagementPage = async (req, res) => {
        const { id } = req.params
        const brand = await Brands.findById(id)
        res.render('pages/management/BrandDetail', {
            title: 'Detail Brand',
            brand: brand,
            errors: null
        })
    }

    deleteBrandManagement = async (req, res) => {
        const { id } = req.params
        const brand = await Brands.findById(id)
        const checkBrand = await Products.exists({ brand: id })
        if (checkBrand) {
            res.render('pages/management/BrandDetail', {
                title: 'Brand Category',
                brand: brand,
                errors: "Brand has been used!"
            })
        } else {
            if (brand.image) {
                fs.unlink("./public/upload/" + brand.image, (err) => {
                    if (err) {
                        console.log('Delete file failed!')
                    } else {
                        console.log('Delete file success')
                    }
                })
            }
            await Brands.findByIdAndDelete(id)
            res.redirect('/management/brand')
        }
    }

    brandUpdateManagement = async (req, res) => {
        try {
            const { id } = req.params
            const { name } = req.body
            const brand = await Brands.findById(id)

            if (!name || name.trim() === '') {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/BrandDetail', {
                    title: 'Detail Brand',
                    brand: brand,
                    errors: 'Name is required!'
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/BrandDetail', {
                            title: 'Detail Brand',
                            brand: brand,
                            errors: 'Image size should not exceed 5MB'
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/BrandDetail', {
                            title: 'Detail Brand',
                            brand: brand,
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.'
                        })
                    } else {
                        const brand = await Brands.findById(id)
                        if (brand.image) {
                            fs.unlink("./public/upload/" + brand.image, (err) => {
                                if (err) {
                                    console.log('Delete file failed!')
                                } else {
                                    console.log('Delete file success')
                                }
                            })
                            await Brands.findByIdAndUpdate(id, { name, image: filename })
                            res.redirect('/management/brand')
                        } else {
                            await Brands.findByIdAndUpdate(id, { name, image: filename })
                            res.redirect('/management/brand')
                        }
                    }
                } else {
                    await Brands.findByIdAndUpdate(id, { name })
                    res.redirect('/management/brand')
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    // Category
    getCategoryManagementPage = async (req, res) => {
        const perPage = 10
        const page = parseInt(req.query.page) || 1
        const categorys = await Categorys.aggregate(
            [
                {
                    $skip: (page - 1) * perPage
                },
                {
                    $limit: perPage
                },
                { $sort: { name: 1 } },

            ]
        )

        await Promise.all(
            categorys.map(async (category) => {
                category.totalProducts = await Products.countDocuments({ category: category._id })
            })
        )

        const count = await Categorys.countDocuments()
        res.render('pages/management/Category', {
            title: 'Category Management',
            categorys: categorys,
            searchValue: null,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getSearchCategoryManagementPage = async (req, res) => {
        const { searchValue } = req.body
        const perPage = 10
        const page = parseInt(req.query.page) || 1

        const categorys = await Categorys.find({
            name: { $regex: searchValue, $options: 'i' }
        }).sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec()

        await Promise.all(
            categorys.map(async (category) => {
                category.totalProducts = await Products.countDocuments({ category: category._id })
            })
        )

        const count = await Categorys.countDocuments()

        res.render('pages/management/Category', {
            title: 'Category Management',
            categorys: categorys,
            searchValue: searchValue,
            current: page,
            pages: Math.ceil(count / perPage)
        })
    }

    getCreateCategoryPage = (req, res) => {
        res.render('pages/management/CategoryCreate', {
            title: 'Create Category',
            data: null,
            errors: null
        })
    }

    createCategory = async (req, res) => {
        try {
            const { name } = req.body
            if (!name || name.trim() === '') {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/CategoryCreate', {
                    title: 'Create Category',
                    data: {
                        name: name
                    },
                    errors: 'Name is required!'
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/CategoryCreate', {
                            title: 'Create Category',
                            data: {
                                name: name
                            },
                            errors: 'Image size should not exceed 5MB'
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/CategoryCreate', {
                            title: 'Create Category',
                            data: {
                                name: name
                            },
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.'
                        })
                    } else {
                        const category = new Categorys({
                            name: name,
                            image: filename
                        })
                        await category.save()
                        res.redirect('/management/category')
                    }
                } else {
                    res.render('pages/management/CategoryCreate', {
                        title: 'Create Category',
                        data: {
                            name: name
                        },
                        errors: 'Image is required!'
                    })
                }
            }
        } catch (err) {
            console.log(err)
            res.redirect('/')
        }
    }

    getCategoryDetailManagementPage = async (req, res) => {
        const { id } = req.params
        const category = await Categorys.findById(id)
        res.render('pages/management/CategoryDetail', {
            title: 'Detail Category',
            category: category,
            errors: null
        })
    }

    deleteCategoryManagement = async (req, res) => {
        const { id } = req.params
        const category = await Categorys.findById(id)
        const checkCategory = await Products.exists({ category: id })
        if (checkCategory) {
            res.render('pages/management/CategoryDetail', {
                title: 'Detail Category',
                category: category,
                errors: "Category has been used!"
            })
        } else {
            if (category.image) {
                fs.unlink("./public/upload/" + category.image, (err) => {
                    if (err) {
                        console.log('Delete file failed!')
                    } else {
                        console.log('Delete file success')
                    }
                })
            }
            await Categorys.findByIdAndDelete(id)
            res.redirect('/management/category')
        }
    }

    categoryUpdateManagement = async (req, res) => {
        try {
            const { id } = req.params
            const { name } = req.body
            const category = await Categorys.findById(id)

            if (!name || name.trim() === '') {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/CategoryDetail', {
                    title: 'Detail Category',
                    category: category,
                    errors: 'Name is required!'
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/CategoryDetail', {
                            title: 'Detail Category',
                            category: category,
                            errors: 'Image size should not exceed 5MB'
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/CategoryDetail', {
                            title: 'Detail Category',
                            category: category,
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.'
                        })
                    } else {
                        const category = await Categorys.findById(id)
                        if (category.image) {
                            fs.unlink("./public/upload/" + category.image, (err) => {
                                if (err) {
                                    console.log('Delete file failed!')
                                } else {
                                    console.log('Delete file success')
                                }
                            })
                        }
                        await Categorys.findByIdAndUpdate(id, { name, image: filename })
                        res.redirect('/management/category')
                    }
                } else {
                    await Categorys.findByIdAndUpdate(id, { name })
                    res.redirect('/management/category')
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    // Product
    getProductManagementPage = async (req, res) => {
        const brands = await Brands.find()
        const categorys = await Categorys.find()
        const perPage = 10
        const page = parseInt(req.query.page) || 1
        const products = await Products.aggregate(
            [
                {
                    $skip: (page - 1) * perPage
                },
                {
                    $limit: perPage
                },
                { $sort: { name: 1 } },

            ]
        )

        const count = await Products.countDocuments()
        res.render('pages/management/Product', {
            title: 'Product Management',
            products: products,
            searchValue: null,
            current: page,
            pages: Math.ceil(count / perPage),
            brands: brands,
            categorys: categorys
        })
    }

    getSearchProductManagementPage = async (req, res) => {
        const brands = await Brands.find()
        const categorys = await Categorys.find()
        const { searchValue } = req.body
        const perPage = 10
        const page = parseInt(req.query.page) || 1

        const products = await Products.find({
            name: { $regex: searchValue, $options: 'i' }
        }).sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec()

        const count = await Products.countDocuments()

        res.render('pages/management/Product', {
            title: 'Product Management',
            products: products,
            searchValue: searchValue,
            current: page,
            pages: Math.ceil(count / perPage),
            brands: brands,
            categorys: categorys
        })
    }

    getCreateProductPage = async (req, res) => {
        const brands = await Brands.find()
        const categorys = await Categorys.find()
        res.render('pages/management/ProductCreate', {
            title: 'Create Product',
            data: null,
            errors: null,
            brands: brands,
            categorys: categorys
        })
    }

    createProduct = async (req, res) => {
        try {
            const brands = await Brands.find()
            const categorys = await Categorys.find()
            const { name, brand, price, quantity, category, description } = req.body
            if (!name ||
                name.trim() === '' ||
                brand === '' ||
                brand.trim() === '' ||
                category === '' ||
                category.trim() === '' ||
                description === '' ||
                description.trim() === ''
            ) {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/ProductCreate', {
                    title: 'Create Product',
                    data: {
                        name,
                        brand,
                        price,
                        quantity,
                        category,
                        description
                    },
                    errors: 'Please fill in the required fields!',
                    brands: brands,
                    categorys: categorys
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/ProductCreate', {
                            title: 'Create Product',
                            data: {
                                name,
                                brand,
                                price,
                                quantity,
                                category,
                                description
                            },
                            errors: 'Image size should not exceed 5MB',
                            brands: brands,
                            categorys: categorys
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/ProductCreate', {
                            title: 'Create Product',
                            data: {
                                name,
                                brand,
                                price,
                                quantity,
                                category,
                                description
                            },
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.',
                            brands: brands,
                            categorys: categorys
                        })
                    } else {
                        const product = new Products({
                            name,
                            brand,
                            price,
                            quantity,
                            category,
                            description,
                            image: filename
                        })
                        await product.save()
                        res.redirect('/management/product')
                    }
                } else {
                    res.render('pages/management/ProductCreate', {
                        title: 'Create Product',
                        data: {
                            name,
                            brand,
                            price,
                            quantity,
                            category,
                            description
                        },
                        errors: 'Image is required!',
                        brands: brands,
                        categorys: categorys
                    })
                }
            }
        } catch (err) {
            console.log(err)
            res.redirect('/')
        }
    }

    getProductDetailManagementPage = async (req, res) => {
        const { id } = req.params
        const brands = await Brands.find()
        const categorys = await Categorys.find()
        const product = await Products.findById(id)
        res.render('pages/management/ProductDetail', {
            title: 'Detail Product',
            product: product,
            errors: null,
            brands: brands,
            categorys: categorys
        })
    }

    deleteProductManagement = async (req, res) => {
        const { id } = req.params
        const product = await Products.findById(id)
        if (product.image) {
            fs.unlink("./public/upload/" + product.image, (err) => {
                if (err) {
                    console.log('Delete file failed!')
                } else {
                    console.log('Delete file success')
                }
            })
            await Products.findByIdAndDelete(id)
            res.redirect('/management/product')
        } else {
            await Products.findByIdAndDelete(id)
            res.redirect('/management/product')
        }
    }

    productUpdateManagement = async (req, res) => {
        try {
            const { id } = req.params
            const { name, brand, price, quantity, category, description } = req.body
            const brands = await Brands.find()
            const categorys = await Categorys.find()
            const product = await Products.findById(id)

            if (
                !name ||
                name.trim() === '' ||
                brand === '' ||
                brand.trim() === '' ||
                category === '' ||
                category.trim() === '' ||
                description === '' ||
                description.trim() === ''
            ) {
                if (req.file) {
                    const { filename } = req.file
                    const filePath = "./public/upload/" + filename
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.log('Delete file failed!')
                        } else {
                            console.log('Delete file success')
                        }
                    })
                }
                res.render('pages/management/ProductDetail', {
                    title: 'Detail Product',
                    product: product,
                    errors: 'Please fill in the required fields!',
                    brands: brands,
                    categorys: categorys
                })
            } else {
                if (req.file) {
                    const { filename, size } = req.file
                    const filePath = "./public/upload/" + filename
                    if (size > 5 * 1048576) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/ProductDetail', {
                            title: 'Detail Product',
                            product: product,
                            errors: 'Image size should not exceed 5MB'
                        })
                    } else if (!checkImage(filename)) {
                        fs.unlink(filePath, (err) => {
                            if (err) {
                                console.log('Delete file failed!')
                            } else {
                                console.log('Delete file success')
                            }
                        })
                        res.render('pages/management/ProductDetail', {
                            title: 'Detail Product',
                            product: product,
                            errors: 'Invalid image format. Only support jpg, jpeg, png, gif.',
                            brands: brands,
                            categorys: categorys
                        })
                    } else {
                        const product = await Products.findById(id)
                        if (product.image) {
                            fs.unlink("./public/upload/" + product.image, (err) => {
                                if (err) {
                                    console.log('Delete file failed!')
                                } else {
                                    console.log('Delete file success')
                                }
                            })
                        }
                        await Products.findByIdAndUpdate(id, {
                            name,
                            brand,
                            price,
                            quantity,
                            category,
                            description,
                            image: filename
                        })
                        res.redirect('/management/product')
                    }
                } else {
                    await Products.findByIdAndUpdate(id, {
                        name,
                        brand,
                        price,
                        quantity,
                        category,
                        description
                    })
                    res.redirect('/management/product')
                }
            }
        } catch (err) {
            console.log(err)
        }
    }
}

export default new controllers()