const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    messages: [{
        text: String, 
        docId : mongoose.Schema.Types.ObjectId,
        readMessage:{type:Boolean,default:false},
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Create a TTL index manually
notificationSchema.index({ "messages.createdAt": 1 }, { expireAfterSeconds: 3600 }); // 1 hour TTL

module.exports = mongoose.model('Notification', notificationSchema);

