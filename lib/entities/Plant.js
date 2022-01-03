const { randomIntFromInterval } = require('../tools');

/**
 * Моментом создания объекта является посадка
 */
class Plant {
    currentStateText = null;
    harvestPerDay = null;
    seedType = null;
    period = null;
    name = null;
    favorableTemp = null; // идеальная температура при которой происходит максимальный рост
    growthPercentDay = null;
    periods = {
        growth: [], // промежуток периода роста
        ripening: [], // промежуток периода созревания
        aging: [],
    };

    create(plant) {

        if (!plant)
            throw new Error('`plant` param cant be empty');
        /*
        Два свойства
        1 - процент роста 0-100%
        2 - кол-во урожая

        След свойства отвечаеют за рост

        1 - благоприятная температура
        2 - удобрение
        3 - благоприятная влажность
        */

        this.name = plant.name;
        this.seedType = plant.seedType;
        this.favorableTemp = plant.favorableTemp;
        this.periods = {
            growth: plant.periods.growth, // промежуток периода роста
            ripening: plant.periods.ripening, // промежуток периода созревания
            aging: plant.periods.aging // промежуток периода старения
        };
        this.harvestPerDay = plant.harvestPerDay;

        this.currentDay = 0;
        this.currentHarvest = 0; // кол-во урожая (прибавляется на стадии созревания)
        this.currentState = 0; // в процентном соотношении

        this.growthPeriod = randomIntFromInterval(this.periods.growth[0], this.periods.growth[1]);
        this.ripeningPeriod = randomIntFromInterval(this.periods.ripening[0], this.periods.ripening[1]);
        this.agingPeriod = randomIntFromInterval(this.periods.aging[0], this.periods.aging[1]);

        return this;
    };

    createFromFIle(file) {
        this.currentStateText = file.currentStateText;
        this.harvestPerDay = file.harvestPerDay;
        this.seedType = file.seedType;
        this.period = file.period;
        this.name = file.name;
        this.favorableTemp = file.favorableTemp;
        this.growthPercentDay = file.growthPercentDay;
        this.periods = file.periods;
        this.currentDay = file.currentDay;
        this.currentHarvest = file.currentHarvest;
        this.currentState = file.currentState;
        this.growthPeriod = file.growthPeriod;
        this.ripeningPeriod = file.ripeningPeriod;
        this.agingPeriod = file.agingPeriod;

        return this;
    };

    saveToFile() {
        return {
            currentStateText: this.currentStateText,
            harvestPerDay: this.harvestPerDay,
            seedType: this.seedType,
            period: this.period,
            name: this.name,
            favorableTemp: this.favorableTemp,
            growthPercentDay: this.growthPercentDay,
            periods: this.periods,
            currentDay: this.currentDay,
            currentHarvest: this.currentHarvest,
            currentState: this.currentState,
            growthPeriod: this.growthPeriod,
            ripeningPeriod: this.ripeningPeriod,
            agingPeriod: this.agingPeriod
        };
    }

    countCurrentHarvest() {
        return 100 / (this.growthPeriod + this.ripeningPeriod);
    }

    countDayHarvest(currentTemp) {
        if (currentTemp <= 0) return 0;

        const percentInDegree = 100 / this.favorableTemp; // 4
        const deltaTemp = Math.abs(currentTemp - this.favorableTemp); // 5
        const percentMinus = deltaTemp * percentInDegree; // 20%
        const countHarvest = this.harvestPerDay  - ((this.harvestPerDay / 100) * percentMinus);

        // добавить рандом
        return countHarvest;
    }

    isIDie() {}

    newDay(currentTemp) {
        this.currentState += this.growthPercentDay;
        this.currentDay++;

        if (this.period !== 'DIE') {
            switch(true) {
                case this.currentDay < this.growthPeriod: // период роста
                    // хз что происходит
                    // увеличивается процент роста
                    this.currentState += this.countCurrentHarvest();
                    this.period = 'GROWTH';
                    this.currentStateText = 'растет';
                    break;

                case this.currentDay < this.growthPeriod + this.ripeningPeriod: // период созревания
                    this.period = 'RIPENING';
                    this.currentStateText = 'созревает';
                    // увеличивается итоговое кол-во урожая
                    this.currentHarvest += this.countDayHarvest(currentTemp);
                    this.currentState += this.countCurrentHarvest();
                    break;

                case this.currentDay < this.growthPeriod + this.ripeningPeriod + this.agingPeriod: // период старения
                    this.period = 'AGING';
                    this.currentStateText = 'портится';
                    this.currentState = 100;

                    // кол во урожая уменьшается
                    const delta = this.currentDay - (this.growthPeriod + this.ripeningPeriod);
                    if (delta > 10) this.currentHarvest -= randomIntFromInterval(0, delta / 3);
                    if (this.currentHarvest < 0) this.currentHarvest = 0;
                    break;

                default:
                    this.period = 'DIE';
                    this.currentStateText = 'погибло';
                    this.currentHarvest = 0;
                    this.currentState = 0;
            }
        }

        //console.log(`${this.name} [${this.period}] выросла на ${Math.round(this.currentState)}% (урожая - ${this.currentHarvest})`);
    }
}

module.exports = Plant;
