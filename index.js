const Weather = require('./lib/entities/world/Weather');
const Economy = require('./lib/entities/world/Economy');

const DB = require('./lib/DB');

const Plant = require('./lib/entities/Plant');

const fieldRouter = require('./routers/field');
const harvestRouter = require('./routers/harvest');
const seedsRouter = require('./routers/seeds');
const authRouter = require('./routers/auth');
const sectorsRouter = require('./routers/sectors');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const port = 1995;
const DAYS = 365;
const ECONOMY_PERIOD = 7;
// const DAY_DURATION = 40000; // игровой год = 4м реальным часам
const DAY_DURATION = 400; // игровой год - 2,5 минуты
const HARVEST_PRICE_FACTOR = 712;

let currentTime = Date.now();
let currentDay = 0;
let currentYear = 2001;

const app = express();
let weather = new Weather();
let economy = new Economy();
const db = new DB();

// Реализуем статистику за день, типо кто за игровой год больше урожая собрал
// может быть потом сделаем возможность покупать поля и сдавать их в аренду
// тоже самое с техникой

const tickAction = async () => {

    const seeds = await db.seeds.find({}).lean().exec();
    const fields = await db.fields.find({}).lean().exec();

    if (Date.now() >= currentTime + (DAY_DURATION * currentDay)) {
        currentDay++;
        const temp = weather.getDayTemp(currentDay);

        for (const id in fields) {
            if (fields[id].crop) {
                const plant = (new Plant()).createFromFIle(fields[id].crop);
                plant.newDay(temp);
                await db.fields.updateOne({ _id: fields[id]._id }, { $set: { crop: plant.saveToFile()}});
            }

            if (fields[id].status === 'RENT') {
                if(fields[id].daysBeforePayment <= 1) {

                    const user = await db.users.findOne({ _id: fields[id].ownerId });

                    if (user.balance >= fields[id].rentPrice || fields[id].crop) {
                        user.balance -= fields[id].establishedPrice;
                        await user.save();
                        await db.fields.updateOne({ _id: fields[id]._id }, { $set: { daysBeforePayment: 365 }});
                    } else {
                        await db.fields.updateOne({ _id: fields[id]._id }, { $set: {
                                daysBeforePayment: null,
                                ownerId: null,
                                status: 'EMPTY'
                            }});
                    }
                } else {
                    await db.fields.updateOne({ _id: fields[id]._id }, { $inc: { daysBeforePayment: -1 }});
                }
            }
        }

        if (currentDay % ECONOMY_PERIOD === 0)
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
app.use(cookieParser());
app.use(express.static('views/public'));
app.use(express.static('node_modules/bootstrap/dist'));
app.use(express.static('node_modules/bootstrap-vue/dist'));
app.use(express.static('node_modules/vue/dist'));
app.use(express.static('views/public'));
app.use(async (req, res, next) => {
    if (req.cookies.auth) {
        const userCookiesData = jwt.verify(req.cookies.auth, 'volvo');

        req.user = await db.users.findOne({ _id: userCookiesData._id }).lean().exec();
        req.user.fields = await db.fields.find({ ownerId: req.user._id }).lean().exec();
    }
    req.economy = economy;
    req.db = db;

    // TODO вынести актуальные цены в отдельную коллекцию, и пересчитывать при обновлении экономики
    req.actualPrices = {};
    const seeds = await req.db.seeds.find({}).lean().exec();
    seeds.forEach((seed) => {
        req.actualPrices[`${seed.type}`] = economy.getPriceFactor(seed.salePrice / HARVEST_PRICE_FACTOR);
        req.actualPrices[`${seed.type}_seed`] = economy.getPriceFactor(seed.salePrice);
    });

    next();
});

app.use('/auth', authRouter);
app.use('/field', fieldRouter);
app.use('/harvest', harvestRouter);
app.use('/seeds', seedsRouter);
app.use('/sectors', sectorsRouter);

app.get('*', (req, res, next) => {
    if(!req.cookies.auth)
        return res.sendFile('views/auth.html', { root: __dirname });
    else
        next();
});
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
app.post('/get_update', async (req, res) => {
    const fields = await req.db.fields.find({}).lean().exec();
    const seeds = await req.db.seeds.find({}).lean().exec();
    const resObject = {
        actualPrices: req.actualPrices,
        priceFactor: economy.getPriceFactor(),
        currentDay, currentYear,
        temp: weather.getDayTemp(currentDay),
        entities: { fields, seeds }
    };
    if (req.user) {
        req.user.regions = await req.db.regions.find({ ownerId: req.user._id }).lean().exec();
        resObject.user = req.user;
    }
    res.json(resObject);
});

app.listen(port, async () => {
    await db.init();
    setInterval(async () => {
        await tickAction();
    }, 350);
    console.log(`Example app listening at http://localhost:${port}`);
});
