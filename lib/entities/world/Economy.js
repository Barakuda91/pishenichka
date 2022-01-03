const { randomIntFromInterval } = require('../../tools');
const perlin = require('perlin-noise');

// TODO реализовать обновление шума по достижению 1000го периода
class Economy {
    constructor() {
        this.newPriceFactor();
    }

    #currentPeriod = 0;
    #noise = perlin.generatePerlinNoise(1000, 1).map((el) => el + 0.5);

    newPriceFactor() {
        this.#currentPeriod++;
    }

    getPriceFactor() {
        return this.#noise[this.#currentPeriod];
    }

    getActualPrice(price) {
        return price * this.getPriceFactor();
    }
}

module.exports = Economy;
