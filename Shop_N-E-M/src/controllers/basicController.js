export const getHomePage = (req, res) => {
    res.render('pages/Homepage', {
        title: "Homepage"
    })
}