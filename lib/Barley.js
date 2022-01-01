const Plant = require('./Plant');

class Barley extends Plant { // ячмень
    constructor() {
        super();

        this.name = 'Ячмень';
        this.seedType = 'barley';
        this.favorableTemp = 25;
        this.periods = {
            growth: [70, 90], // промежуток периода роста
            ripening: [40, 70], // промежуток периода созревания
            aging: [93, 188], // промежуток периода старения
        };

        this.harvestPerDay = 20;
        this.start();
    };
}

module.exports = Barley;
