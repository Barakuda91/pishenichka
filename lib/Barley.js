const Plant = require('./Plant');

class Barley extends Plant { // ячмень
    constructor() {
        super();

        this.name = 'Ячмень';
        this.seedType = 'barley';
        this.favorableTemp = 25;
        this.periods = {
            growth: [95, 120], // промежуток периода роста
            ripening: [52, 68], // промежуток периода созревания
            aging: [93, 128], // промежуток периода старения
        };

        this.harvestPerDay = 60;
        this.start();
    };
}

module.exports = Barley;
