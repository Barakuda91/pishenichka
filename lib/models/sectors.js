const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    buildings: Mixed,
    position: Mixed,
    crop: Mixed,
    size: { type: Number, required: true },
    isFree: { type: Boolean, default: true },
    daysBeforePayment: { type: Number, default: 0 },
    establishedPrice: { type: Number, default: 0 },
    rentPrice: Number,
    salePrice: Number,
    ownerId: Schema.Types.ObjectId,
    parentRegion: Schema.Types.ObjectId,
    type: {
        type: String,
        enum: ['FIELD', 'VINEYARD', 'GARDEN','WAREHOUSE','ELEVATOR','GARAGE','WINERY','BREWERY','DISTILLERY','BAKERY'],
        required: true,
    },
    status: {
        type: String,
        enum: ['RENT', 'BOUGHT', 'EMPTY'],
        required: true,
        default: 'EMPTY'
    },
    filed: { type: Number, default: 0 }
});
