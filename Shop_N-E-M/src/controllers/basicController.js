export const getHomePage = (req, res) => {
    const saleEndDate = new Date('2024-09-01T00:00:00').getTime();
    res.render('pages/Homepage', {
        title: "Homepage",
        saleEndDate
    })
}