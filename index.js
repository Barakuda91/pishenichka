const Wheat = require('./lib/Wheat');
const Barley = require('./lib/Barley');
const Weather = require('./lib/Weather');
const Economy = require('./lib/Economy');
const express = require('express');
const bodyParser = require('body-parser');

const { randomIntFromInterval } = require('./lib/tools');

const port = 1995;
const DAYS = 365;
const DAY_DURATION = 400;
const HARVEST_PRICE_FACTOR = 712;

let currentTime = Date.now();
let currentDay = 0;
let currentYear = 2001;

const app = express();
let weather = new Weather();
let economy = new Economy();

// Должен быть класс поля, которым мы будем засеивать
// Реализуем статистику за день, типо кто за игровой год больше урожая собрал
// Год = часу ? Тогда не будет проблемы что нчью игроки спят и не могут собрать урожай
// может быть потом сделаем возможность покупать поля и сдавать их в аренду
// тоже самое с техникой

// ИМПРОВИЗИРОВАНАЯ БАЗА
const entities = {
    fields: [ // доступные поля для аренды/покупки
        { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 19, isFree: true, rentPrice: 4750, establishedPrice: null, salePrice: 199500, owner: null, status: null, filed: 0 },
        { buildings: { garage: { lv: 0 }, elevator: { lv: 3 }, irrigationComplex: { lv: 2 }, assembler: { lv: 0 }, emitter: { lv: 3 }}, size: 32, isFree: true, rentPrice: 8000, establishedPrice: null, salePrice: 336000, owner: null, status: null, filed: 0 },
        { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 59, isFree: true, rentPrice: 14750, establishedPrice: null, salePrice: 619500, owner: null, status: null, filed: 0 },
        { buildings: { garage: { lv: 2 }, elevator: { lv: 3 }, irrigationComplex: { lv: 1 }, assembler: { lv: 1 }, emitter: { lv: 2 }}, size: 78, isFree: true, rentPrice: 19500, establishedPrice: null, salePrice: 819000, owner: null, status: null, filed: 0 }
    ],
    seeds: [
        { name: 'Пишеничка', type: 'wheat', salePrice: 200 },
        { name: 'Ячмень', type: 'barley', salePrice: 350 }
    ]
};

const actualPrices = {
    wheat_seed: economy.getPriceFactor(entities.seeds.find((el) => el.type === 'wheat').salePrice),
    barley_seed: economy.getPriceFactor(entities.seeds.find((el) => el.type === 'barley').salePrice),
    wheat: economy.getPriceFactor(entities.seeds.find((el) => el.type === 'wheat').salePrice / HARVEST_PRICE_FACTOR),
    barley: economy.getPriceFactor(entities.seeds.find((el) => el.type === 'barley').salePrice / HARVEST_PRICE_FACTOR)
};
function textSpent(amount) { return `Списано с баланса ${amount.toFixed(0)}` }
function textReceived(amount) { return `Получено на баланс ${amount.toFixed(0)}` }
const user = {
    _id: '7823-1231-412321-1231-3123',
    crops: {}, // посевы - тут идентификатор поля, статус
    warehouse: { seeds: { wheat: 0, barley: 0 }, harvest: { wheat: 0, barley: 0 }}, // склады
    balance: 100000
};
// КОНЕЦ БАЗЕ

const action = async () => {

    if (Date.now() >= currentTime + (DAY_DURATION * currentDay)) {
        currentDay++;
        const temp = weather.getDayTemp(currentDay);

        // console.log(`It is ${currentDay} day of ${currentYear} year. Temp ${temp} C`);

        for (const id in entities.fields) {
            if (entities.fields[id].crop) {
                const entity = entities.fields[id].crop
                entity.newDay(temp);
            }
        }

        if (currentDay % 10 === 0)
            economy.newPriceFactor();

        if (currentDay >= DAYS) {
            currentYear++;
            currentDay = 0;
            currentTime = Date.now();
            console.log('Heavy New Year', currentYear);
            weather = new Weather();
            economy = new Economy();
        }
    }

};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views/public'));
app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname });
});

app.post('/get_field_factors', (req, res) => {
    res.json({
        code: 200,
        data: {
            fieldGarage: [0.08, 0.1, 0.13, 0.18, 0.25],
            fieldElevator: [0.25, 0.36, 0.47, 0.58, 0.70],
            fieldIrrigationComplex: [0.15, 0.26, 0.37, 0.48, 0.59],
            fieldAssembler: [0.09, 0.12, 0.18, 0.22, 0.38],
            fieldEmitter: [0.1, 0.21, 0.29, 0.35, 0.49],
        }
    });
});

app.post('/get_update', (req, res) => {

    res.json({
        actualPrices,
        priceFactor: economy.getPriceFactor(),
        currentDay, currentYear,
        temp: weather.getDayTemp(currentDay),
        balance: user.balance,
        entities,
        user
    });
});

app.post('/field/sow', (req, res) => {
    const field = entities.fields[req.body.id];
    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    const seed = entities.seeds.find((el) => el.type === req.body.seedType);

    if (!seed)
        return res.json({ error: 'Не правильно указан тип семян' });

    if (req.body.quantity > field.size)
        req.body.quantity = field.size;

    if (user.warehouse.seeds[seed.type] < req.body.quantity)
        return res.json({ error: 'Не хватает семян' });

    switch (seed.type) {
        case "wheat": field.crop = new Wheat(); break;
        case "barley": field.crop = new Barley(); break;
    }
    user.warehouse.seeds[seed.type] -= req.body.quantity;
    field.filed = req.body.quantity;
});

app.post('/field/harvest', (req, res) => {
    const field = entities.fields[req.body.id];

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    if (!field.crop)
        return res.json({ error: 'Это поле не засеяно' });

    if (field.crop.period !== 'AGING')
        return res.json({ error: 'Урожай не созрел' });

    user.warehouse.harvest[field.crop.seedType] += field.crop.currentHarvest * field.filed;
    field.crop = null;
});

app.post('/field/clear', (req, res) => {
    const field = entities.fields[req.body.id];

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    if (field.crop.period === 'DIE')
        field.crop = null;

    res.json({ code: 200 });
});

app.post('/harvest/sell', (req, res) => {
    if (user.warehouse.harvest[req.body.harvestType] <= 0)
        return res.json({ error: 'Нечего продавать' });

    if (req.body.quantity > user.warehouse.harvest[req.body.harvestType])
        req.body.quantity = user.warehouse.harvest[req.body.harvestType];

    const price = actualPrices[req.body.harvestType] * req.body.quantity;

    user.balance += price;
    user.warehouse.harvest[req.body.harvestType] -= req.body.quantity;

    res.json({ code: 200, text: textReceived(price)});
});

app.post('/seeds/buy', (req, res) => {
    const seed = entities.seeds.find((el) => el.type === req.body.seedType);
    req.body.quantity = Number(req.body.quantity);
    const price = economy.getActualPrice(seed.salePrice * req.body.quantity);

    if (!seed)
        return res.json({ error: 'Не правильно указан тип семян' });

    if (price > user.balance)
        return res.json({ error: 'У вас не достаточно денег' });

    user.balance -= price;
    user.warehouse.seeds[req.body.seedType] += req.body.quantity;

    res.json({ code: 200, text: textSpent(price) });
});

app.post('/field/unrent', (req, res) => {
    const field = entities.fields[req.body.id];

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    field.owner = null;
    field.status = null;

    res.json({ code: 200 });
});

app.post('/field/rent', (req, res) => {
    const field = entities.fields[req.body.id];
    const price = economy.getActualPrice(field.rentPrice);

    if (field.owner)
        return res.json({ error: 'Это поле занято' });
    if (price > user.balance)
        return res.json({ error: 'У вас не достаточно денег' });

    user.balance -= price;
    field.owner = user._id;
    field.establishedPrice = price;
    field.status = 'rent';

    res.json({ code: 200, text: textSpent(price) });
});

app.post('/field/buy', (req, res) => {
    const field = entities.fields[req.body.id];
    const price = economy.getActualPrice(field.salePrice);

    if (field.owner)
        return res.json({ error: 'Это поле занято' });

    if (price > user.balance)
        return res.json({ error: 'У вас не достаточно денег' });

    user.balance -= price;
    field.owner = user._id;
    field.status = 'bought';

    res.json({ code: 200, text: textSpent(price) });
});

app.post('/field/sell', (req, res) => {
    const field = entities.fields[req.body.id];
    const price = economy.getActualPrice(field.salePrice);

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    user.balance += price;
    field.owner = null;
    field.status = null;

    res.json({ code: 200, text: textReceived(price)});
});

app.listen(port, async () => {
    setInterval(async () => {
        await action();
    }, 100);
    console.log(`Example app listening at http://localhost:${port}`);
});
