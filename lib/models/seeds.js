const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    name: String,
    type: String,
    salePrice: Number
});
