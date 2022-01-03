const Plant = require('../Plant');

class Wheat extends Plant { // пшеница
    constructor() {
        super();

        this.name = 'Пишеничка';
        this.seedType = 'wheat';
        this.favorableTemp = 23;
        this.periods = {
            growth: [70, 90], // промежуток периода роста
            ripening: [50, 80], // промежуток периода созревания
            aging: [120, 220], // промежуток периода старения
        };

        this.harvestPerDay = 30;
        this.start();
    };
}

module.exports = Wheat;
