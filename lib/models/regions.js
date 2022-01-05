const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    position: Mixed,
    fertility: Number,
    water: Number,
    totalSpace: { type: Number, default: 10 },
    availableSpace: { type: Number, default: 10 },
    sectors: Mixed,
    ownerId: ObjectId
});
