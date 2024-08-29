import Products from '../models/productModel.js'
import Brands from '../models/brandModel.js'

export const getHomePage = async (req, res) => {
    try {
        const { brand } = req.body;

        const brands = await Brands.find();

        const query = brand ? { brand } : {};
        const products = await Products.find(query).sort({ views: -1 }).limit(10);

        const saleEndDate = new Date('2024-09-01T00:00:00').getTime();
        res.render('pages/Homepage', {
            title: "Homepage",
            products,
            saleEndDate,
            brands
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).send('Server Error');
    }
};




