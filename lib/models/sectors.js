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
    userId: Schema.Types.ObjectId,
    parentRegion: Schema.Types.ObjectId,
    type: {
        type: String,
        // enum: ['FIELD', 'VINEYARD', 'GARDEN','WAREHOUSE','ELEVATOR','WELL','GARAGE','WINERY','BREWERY','DISTILLERY','BAKERY'],
        enum: ['FIELD', 'VINEYARD', 'GARDEN','ORCHARD','CORRAL','WAREHOUSE','BUILD'],
        required: true,
    },
    state: {
        type: String,
        enum: ['FREE', 'BUSY'],
        required: true,
        default: 'FREE'
    },
    status: {
        type: String,
        enum: ['RENT', 'PRIVATE', 'EMPTY'],
        required: true,
        default: 'EMPTY'
    },
    filed: { type: Number, default: 0 }
});
