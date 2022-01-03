const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    buildings: Mixed,
    size: Number,
    isFree: Boolean,
    rentPrice: Number,
    establishedPrice: Number,
    salePrice: Number,
    ownerId: Schema.Types.ObjectId,
    status: {
        type: String,
        enum: ['RENT', 'BOUGHT', 'EMPTY'],
        required: true,
        default: 'EMPTY'
    },
    filed: Number
});
