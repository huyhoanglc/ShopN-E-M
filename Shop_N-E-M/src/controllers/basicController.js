import Products from '../models/productModel.js';

export const getHomePage = async (req, res) => {
    try {
        const { brand } = req.body;

        const query = brand ? { brand } : {};
        const products = await Products.find(query);

        const saleEndDate = new Date('2024-09-01T00:00:00').getTime();

        res.render('pages/Homepage', {
            title: "Homepage",
            products,
            saleEndDate
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        res.status(500).send('Server Error');
    }
};
