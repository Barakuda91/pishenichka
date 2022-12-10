const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;

module.exports = new Schema({
    type: String,
    duration: Number,
    timeLeft: Number,
    timePassed: Number,
    customerId: ObjectId,
    agronomistId: ObjectId
});
