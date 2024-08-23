import mongoose from "mongoose"

const Schema = mongoose.Schema

const brandSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Brands', brandSchema)