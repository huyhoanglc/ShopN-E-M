import mongoose from "mongoose"

const Schema = mongoose.Schema

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 0
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        required: true
    },
    sales: {
        type: Number,
        default: 0,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Products', productSchema)