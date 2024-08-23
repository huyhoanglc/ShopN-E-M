import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/upload')
    },
    filename: function (req, file, cb) {
        const now = new Date();
        const uniqueSuffix = `${now.getDate()}.${now.getMonth() + 1}.${now.getFullYear()}-${now.getHours()}.${now.getMinutes()}.${now.getSeconds()}-${file.originalname}`
        cb(null, uniqueSuffix)
    }
})

export const uploadFile = multer({ storage: storage })