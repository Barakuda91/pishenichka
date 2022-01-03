const { randomIntFromInterval } = require('../../tools');
const call = require('../../../callendar.json');

class Weather {
    constructor() {
        this.annualRate = this.getAnnualRate(); // ещегодный коэфициент сдвига температурного шаблона
        this.days = {};
    }

    getDayTemp(currentDay) {
        if (!this.days[currentDay]) {
            const tempMiddle = call[currentDay] + this.annualRate;
            this.days[currentDay] = randomIntFromInterval(tempMiddle - 4, tempMiddle + 4);
        }

        return this.days[currentDay];
    }

    getAnnualRate() {
        return randomIntFromInterval(-5, 5);
    }
}

module.exports = Weather;
