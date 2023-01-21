const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;
// таблица купленных производств с привязкой к
// региону и пользователю
/**
 * [{
 *         startCycle: Number,
 *         cycleDuration: Number,
 *         inputProduct: String, //
 *         inputProductAmount: Number, //
 *         outputProduct: String, //
 *         outputProductAmount: Number, //
 *     }]
 */
module.exports = new Schema({
    cycles: { type: Mixed, default: {}, required: true},
    sectorId: ObjectId,
    productionName: String, // идентификатор типа производства из productions_list
    createdTime: Number,
    endOfConstruction: Number,
    ownerId: ObjectId, // владелец
    userId: ObjectId // пользователь
});
