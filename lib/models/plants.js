const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    name: String,
    seedType: String,
    periods: {
        growth: Mixed,
        ripening: Mixed,
        aging: Mixed
    },
    harvestPerDay: Number,
    favorableTemp: Number
});
