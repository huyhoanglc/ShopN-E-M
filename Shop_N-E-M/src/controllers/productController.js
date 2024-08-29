import Products from '../models/productModel.js'
import Brands from '../models/brandModel.js'

export const getProductPage = async (req, res) => {
    try {
        const products = await Products.find(); // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        const brands = await Brands.find(); // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        res.render('pages/product', {
            title: "Product",
            products, // Truyền dữ liệu sản phẩm đến view
            brands
        });
    } catch (err) {
        res.status(500).send(err.message); // Xử lý lỗi
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { searchValue } = req.body
        const products = await Products.find({ name: { $regex: searchValue, $options: 'i' } }).limit(10)
        const brands = await Brands.find()
        res.render('pages/product', {
            title: "Product",
            products,
            brands
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

export const getProductDetail = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Products.findById(productId);
        if (!product) {
            return res.status(404).render('404', { title: 'Product Not Found' });
        }


        // Lấy danh sách các sản phẩm cùng thương hiệu (trừ sản phẩm hiện tại)
        const relatedProducts = await Products.find({
            brand: product.brand,
            _id: { $ne: productId } // Loại trừ sản phẩm hiện tại
        });

        res.render('pages/Productdetail', {
            title: product.name,
            product,
            relatedProducts
        });

        res.render('pages/Productdetail', { title: product.name, product });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

export const getProductByBrand = async (req, res) => {
    try {
        const brandId = req.params.id;
        const products = await Products.find({ brand: brandId }); // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        const brands = await Brands.find(); // Lấy tất cả sản phẩm từ cơ sở dữ liệu
        res.render('pages/product', {
            title: "Product",
            products, // Truyền dữ liệu sản phẩm đến view
            brands
        });
    } catch (err) {
        res.status(500).send(err.message); // Xử lý lỗi
    }
};