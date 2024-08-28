import mongoose from "mongoose"

const Schema = mongoose.Schema

const cartSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    products: {
        type: Array
    }
}, { timestamps: true })

export default mongoose.model('Carts', cartSchema)