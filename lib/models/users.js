const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    login: { type: String, required: true },
    name: { type: String, default: 'player' },
    pass: { type: String, required: true },
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
