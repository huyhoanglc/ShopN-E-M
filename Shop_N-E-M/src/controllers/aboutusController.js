export const getAboutusPage = (req, res) => {
    res.render('pages/aboutus', {
        title: 'About Us',
        data: null,
        errors: null
    })
}