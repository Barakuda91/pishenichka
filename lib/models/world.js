const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    crops: Mixed,
    warehouse: Mixed,
    balance: { type: Number, default: 10000 }
});
