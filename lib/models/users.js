const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    crops: Mixed,
    warehouse: {
        seeds: {
            barley: { type: Number, default: 0 },
            wheat: { type: Number, default: 0 },
            corn: { type: Number, default: 0 },
        },
        harvest: {
            barley: { type: Number, default: 0 },
            wheat: { type: Number, default: 0 },
            corn: { type: Number, default: 0 },
        },
    },
    balance: { type: Number, default: 10000 }
});
