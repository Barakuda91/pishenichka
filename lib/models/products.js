const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;
// таблица возможных продуктов
module.exports = new Schema({
    title: String, // пшеница
    name: String,
    type: String,
    baseBuyPrice: Number,
    baseSellPrice: Number,
    productionTime: Number,
    productionAmount: Number,
    isTradable: {
        type: Number,
        default: 1
    }
});
