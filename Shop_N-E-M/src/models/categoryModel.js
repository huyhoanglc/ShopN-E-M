import mongoose from "mongoose"

const Schema = mongoose.Schema

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Categorys', categorySchema)