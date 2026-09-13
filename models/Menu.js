const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for converting _id to id string for gRPC / frontend compatibility
menuSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('Menu', menuSchema);
