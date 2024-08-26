import Products from '../models/productModel.js'
import Brands from '../models/brandModel.js'

export const getHomePage = async (req, res) => {
    try {
        const { brand } = req.body;

        const brands = await Brands.find();

        const query = brand ? { brand } : {};
        const products = await Products.find(query);

        const saleEndDate = new Date('2024-09-01T00:00:00').getTime();

        function getRandomProducts(products, count) {
            return products.sort(() => 0.5 - Math.random()).slice(0, count);
          }
          
          const randomproducts = getRandomProducts(products, 10);
        res.render('pages/Homepage', {
            title: "Homepage",
            products,
            saleEndDate,
            brands,
            randomproducts: randomproducts
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).send('Server Error');
    }
};
