const { randomIntFromInterval } = require('../../tools');
const call = require('../../../callendar.json');

class Weather {
    constructor() {
        this.init();
    }
    init() {
        this.annualRate = this.getAnnualRate(); // ежегодный коэфициент сдвига температурного шаблона
        console.log('SET this.annualRate', this.annualRate);
        this.days = {};
    }

    reInit() {
        this.init();
    }

    getDayTemp(currentDay) {
        if (!this.days[currentDay]) {
            const tempMiddle = call[currentDay] + this.annualRate;
            this.days[currentDay] = randomIntFromInterval(tempMiddle - 1, tempMiddle + 1);
        }

        console.log('SET temp/day = ', this.days[currentDay], `currentDay = ${currentDay}, this.annualRate = ${this.annualRate}, call[currentDay] = ${call[currentDay]}`);
        return this.days[currentDay];
    }

    getAnnualRate() {
        return randomIntFromInterval(-7, 7);
    }
}

module.exports = Weather;
