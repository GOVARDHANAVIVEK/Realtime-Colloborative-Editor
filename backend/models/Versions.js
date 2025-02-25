const mongoose = require('mongoose');

const versionSchema = mongoose.Schema({
    title: {
        type: String,
        required: true // Ensures title is always provided
    },
    lastSaved: {
        type: String
    },
    savedBy: { // Fix key name typo from 'svaedBy' to 'savedBy'
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Assuming you have a User model
    },
    content: {
        type: String
    },
    DocId: { // Ensure consistency in naming (DocId instead of DocID)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Documents'
    },
    __v:{
        type:Number
        
    }
},{ versionKey: false });

const Versions = mongoose.model('Versions', versionSchema);
module.exports = Versions;
