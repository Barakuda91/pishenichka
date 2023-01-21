const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

// коллекция сделок
module.exports = new Schema({
    amount: String,
    price: String,
    owner: ObjectId,
    type: {
        type: String,
        enum: ['LIMIT','MARKET'],
        required: true
    },
    side: {
        type: String,
        enum: ['SELL','BUY'],
        required: true
    },
    status: {
        type: String,
        enum: ['NEW','PARTIALLY_FILLED','FILLED','CANCELED','PENDING_CANCEL','REJECTED','EXPIRED'],
        required: true
    },
    product: String,
});
