const mongoose=require('mongoose')
const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String},
    gender:{ type: String},
},{ timestamps: true });

const User = mongoose.model('user',userSchema)
module.exports = User