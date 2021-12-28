const Wheat = require('./lib/Wheat');
const Barley = require('./lib/Barley');
const Weather = require('./lib/Weather');
const express = require('express');
const bodyParser = require('body-parser');

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
    fields: [ // доступные поля для аренды/покупки
        { size: 19, isFree: true, rentPrice: 1805, salePrice: 13262, owner: null, status: null },
        { size: 32, isFree: true, rentPrice: 3040, salePrice: 22336, owner: null, status: null },
        { size: 59, isFree: true, rentPrice: 5605, salePrice: 41182, owner: null, status: null },
        { size: 78, isFree: true, rentPrice: 7410, salePrice: 54444, owner: null, status: null }
    ],
    seeds: [
        { name: 'Пишеничка', type: 'wheat', salePrice: 150 },
        { name: 'Ячменё', type: 'barley', salePrice: 190 }
    ]
};

const user = {
    _id: '7823-1231-412321-1231-3123',
    crops: {}, // посевы - тут идентификатор поля, статус
    warehouse: { seeds: { wheat: 0, barley: 0 }, harvest: { wheat: 0, barley: 0 }}, // склады
    balance: 10000
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

        if (currentDay >= DAYS) {
            currentYear++;
            currentDay = 0;
            currentTime = Date.now();
            console.log('Heavy New Year', currentYear);
            weather = new Weather();
        }
    }

};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views/public'));
app.get('/', (req, res) => {
    res.sendFile('views/index.html', { root: __dirname });
});

app.post('/get_update', (req, res) => {
    res.json({
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


    if (user.warehouse.seeds[seed.type] < field.size)
        return res.json({ error: 'Не хватает семян' });

    switch (seed.type) {
        case "wheat": entities.fields[req.body.id].crop = new Wheat(); break;
        case "barley": entities.fields[req.body.id].crop = new Barley(); break;
    }
    user.warehouse.seeds[seed.type] -= field.size;
});

app.post('/field/harvest', (req, res) => {
    const field = entities.fields[req.body.id];

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    if (!field.crop)
        return res.json({ error: 'Это поле не засеяно' });

    if (field.crop.period !== 'AGING')
        return res.json({ error: 'Урожай не созрел' });

    user.warehouse.harvest[field.crop.seedType] += field.crop.currentHarvest * field.size;
    field.crop = null;
});

app.post('/field/sell', (req, res) => { return res.json({ error: 'Не имплементированно' }); });

app.post('/field/clear', (req, res) => {
    const field = entities.fields[req.body.id];

    if (field.owner !== user._id)
        return res.json({ error: 'Это не ваше поле' });

    if (field.crop.period === 'DIE')
        field.crop = null;

    res.json({ code: 200 });
});

app.post('/field/buy', (req, res) => {return res.json({ error: 'Не имплементированно' });});

app.post('/harvest/sell', (req, res) => {
    if (user.warehouse.harvest[req.body.harvestType] <= 0)
        return res.json({ error: 'Нечего продавать' });

    user.balance += user.warehouse.harvest[req.body.harvestType] / 5;
    user.warehouse.harvest[req.body.harvestType] = 0;

    res.json({ code: 200 });
});

app.post('/seeds/buy', (req, res) => {
    const seed = entities.seeds.find((el) => el.type === req.body.seedType);
    req.body.quantity = Number(req.body.quantity);
    if (!seed)
        return res.json({ error: 'Не правильно указан тип семян' });

    if (seed.salePrice * req.body.quantity > user.balance)
        return res.json({ error: 'У вас не достаточно денег' });

    user.balance -= seed.salePrice * req.body.quantity;
    user.warehouse.seeds[req.body.seedType] += req.body.quantity;

    res.json({ code: 200 });
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

    if (field.owner)
        return res.json({ error: 'Это поле занято' });
    if (field.rentPrice > user.balance)
        return res.json({ error: 'У вас не достаточно денег' });

    user.balance -= field.rentPrice;
    field.owner = user._id;
    field.status = 'rent';

    res.json({ code: 200 });
});

app.post('/field/buy', (req, res) => {

    res.json({
        plants, currentDay, currentYear, temp: weather.getDayTemp(currentDay), balance: 10000, entities
    });
});

app.listen(port, async () => {
    setInterval(async () => {
        await action();
    }, 100);
    console.log(`Example app listening at http://localhost:${port}`);
});
