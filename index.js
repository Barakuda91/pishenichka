const Wheat = require('./lib/Wheat');
const Barley = require('./lib/Barley');
const Weather = require('./lib/Weather');
const express = require('express');

const { randomIntFromInterval } = require('./lib/tools');

const port = 1995;
const DAYS = 365;
const DAY_DURATION = 400;

let currentTime = Date.now();
let currentDay = 0;
let currentYear = 2001;

const app = express();
let weather = new Weather();

// Должен быть класс поля, которым мы будем засеивать
// Реализуем статистику за день, типо кто за игровой год больше урожая собрал
// Год = часу ? Тогда не будет проблемы что нчью игроки спят и не могут собрать урожай
// может быть потом сделаем возможность покупать поля и сдавать их в аренду
// тоже самое с техникой

// ИМПРОВИЗИРОВАНАЯ БАЗА
const entities = {
    wealds: [ // доступные поля для аренды/покупки
        { size: 19, isFree: true, rentPrice: 1805, salePrice: 13262, owner: null },
        { size: 32, isFree: true, rentPrice: 3040, salePrice: 22336, owner: null },
        { size: 59, isFree: true, rentPrice: 5605, salePrice: 41182, owner: null },
        { size: 78, isFree: true, rentPrice: 7410, salePrice: 54444, owner: null }
    ],
};

const user = {
    crops: {}, // посевы - тут идентификатор поля, статус
    warehouse: {}, // склады
    balance: 10000
};
// КОНЕЦ БАЗЕ

const plants = [
    new Wheat(),
    new Barley()
];

const action = async () => {

    if (Date.now() >= currentTime + (DAY_DURATION * currentDay)) {
        currentDay++;
        const temp = weather.getDayTemp(currentDay);

        console.log(`It is ${currentDay} day of ${currentYear} year. Temp ${temp} C`);

        for (const plantId in plants) {
            plants[plantId].newDay(temp);

            if (plants[plantId].isIDie())
                plants.splice(plantId, 1);
        }

        if (currentDay >= DAYS) {
            currentYear++;
            currentDay = 0;
            currentTime = Date.now();
            console.log('Heavy New Year', currentYear);
            weather = new Weather();
        }
    }

};

app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname });
});

app.post('/get_update', (req, res) => {
    res.json({
        plants, currentDay, currentYear, temp: weather.getDayTemp(currentDay), balance: 10000
    });
});

app.listen(port, async () => {
    setInterval(async () => {
        await action();
    }, 100);
    console.log(`Example app listening at http://localhost:${port}`);
});
