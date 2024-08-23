import express from 'express'
import ctrl from '../controllers/managementController.js'
import { uploadFile } from '../config/multer.js'
const managementRouter = express.Router()

managementRouter.get('/', ctrl.getManagementPage)

// account
managementRouter.get('/account', ctrl.getAccountManagementPage)
managementRouter.get('/account/delete/:id', ctrl.deleteAccountManagement)
managementRouter.post('/account', ctrl.getSearchAccountManagementPage)
managementRouter.get('/account/:id', ctrl.getDetailAccountManagementPage)
managementRouter.post('/account/update/:id', ctrl.userUpdateManagement)

// brand
managementRouter.get('/brand', ctrl.getBrandManagementPage)
managementRouter.post('/brand', ctrl.getSearchBrandManagementPage)
managementRouter.get('/brand/create', ctrl.getCreateBrandPage)
managementRouter.post('/brand/create', uploadFile.single('image'), ctrl.createBrand)
managementRouter.get('/brand/:id', ctrl.getBrandDetailManagementPage)
managementRouter.get('/brand/delete/:id', ctrl.deleteBrandManagement)
managementRouter.post('/brand/update/:id', uploadFile.single('image'), ctrl.brandUpdateManagement)

// Category
managementRouter.get('/category', ctrl.getCategoryManagementPage)
managementRouter.post('/category', ctrl.getSearchCategoryManagementPage)
managementRouter.get('/category/create', ctrl.getCreateCategoryPage)
managementRouter.post('/category/create', uploadFile.single('image'), ctrl.createCategory)
managementRouter.get('/category/:id', ctrl.getCategoryDetailManagementPage)
managementRouter.get('/category/delete/:id', ctrl.deleteCategoryManagement)
managementRouter.post('/category/update/:id', uploadFile.single('image'), ctrl.categoryUpdateManagement)

// Product
managementRouter.get('/product', ctrl.getProductManagementPage)
managementRouter.post('/product', ctrl.getSearchProductManagementPage)
managementRouter.get('/product/create', ctrl.getCreateProductPage)
managementRouter.post('/product/create', uploadFile.single('image'), ctrl.createProduct)
managementRouter.get('/product/:id', ctrl.getProductDetailManagementPage)
managementRouter.get('/product/delete/:id', ctrl.deleteProductManagement)
managementRouter.post('/product/update/:id', uploadFile.single('image'), ctrl.productUpdateManagement)

export default managementRouter