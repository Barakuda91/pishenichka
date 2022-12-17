const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = mongoose.Mixed;
const ObjectId = Schema.ObjectId;
// таблица производств (генераторов товаров) -
// список всех доступных к покупке производств
module.exports = new Schema({
    title: String,
    type: String,
    name: String,
    stage: Number, // шаг производства
    basePrice: Number, // базовая цена, на которую влияют коэффициенты
    placeSize: Number, // какую площадь занимает постройка. Если 0 - то может занимать сколько угодно места
    buildTime: Number, // скорость постройки (дней)
    recipes: [{
        name: String,
        inputProducts: Mixed,
        outputProducts: Mixed,
        cycleDuration: Number,
        cost: Number
    }],
});
