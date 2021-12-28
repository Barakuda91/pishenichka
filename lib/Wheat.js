const Plant = require('./Plant');

class Wheat extends Plant { // пшеница
    constructor() {
        super();

        this.name = 'Пишеничка';
        this.seedType = 'wheat';
        this.favorableTemp = 23;
        this.periods = {
            growth: [101, 145], // промежуток периода роста
            ripening: [40, 48], // промежуток периода созревания
            aging: [141, 203], // промежуток периода старения
        };

        this.harvestPerDay = 80;
        this.start();
    };
}

module.exports = Wheat;
