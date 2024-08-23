import jwt from 'jsonwebtoken'

const generateToken = (user, expIn) => {
    const payload = {
        userId: user._id
    }

    const options = {
        expiresIn: expIn
    }

    return jwt.sign(payload, process.env.TOKEN_SECRET, options)
}

export default generateToken