const Plant = require('../Plant');

class Corn extends Plant { // ячмень
    constructor() {
        super();

        this.name = 'Кукуруза';
        this.seedType = 'corn';
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

module.exports = Corn;
