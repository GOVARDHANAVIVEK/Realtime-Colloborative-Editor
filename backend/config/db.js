const mongoose = require('mongoose')
require('dotenv').config();
async function connectMongooseDB() {
    await mongoose.connect(process.env.MONGOOSE_URI).then(()=>{
        console.log("Mongoose database connected successfully.")
    }).catch((error)=>{
        console.log("Unable to connect to mongoose DB: ",error);
    })
}

module.exports=connectMongooseDB;