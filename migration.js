const DB = require('./lib/DB');
const {randomIntFromInterval} = require('./lib/tools');

const perlin = require('perlin-noise');

const db = new DB();

(async () => {
    await db.init();

    // await db.sectors.deleteMany({});
    // await db.sectors.insertMany([
    //     { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 19, isFree: true, rentPrice: 4750, salePrice: 199500, status: 'EMPTY', filed: 0 },
    //     { buildings: { garage: { lv: 0 }, elevator: { lv: 3 }, irrigationComplex: { lv: 2 }, assembler: { lv: 0 }, emitter: { lv: 3 }}, size: 32, isFree: true, rentPrice: 8000, salePrice: 336000, status: 'EMPTY', filed: 0 },
    //     { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 59, isFree: true, rentPrice: 14750, salePrice: 619500, status: 'EMPTY', filed: 0 },
    //     { buildings: { garage: { lv: 2 }, elevator: { lv: 3 }, irrigationComplex: { lv: 1 }, assembler: { lv: 1 }, emitter: { lv: 2 }}, size: 78, isFree: true, rentPrice: 19500, salePrice: 819000, status: 'EMPTY', filed: 0 }
    // ]);

    await db.seeds.deleteMany({});
    await db.seeds.insertMany([
        { name: 'Пишеничка', type: 'wheat', salePrice: 150 },
        { name: 'Ячмень', type: 'barley', salePrice: 190 },
        { name: 'Кукуруза', type: 'corn', salePrice: 190 }
    ]);

    await db.plants.deleteMany({});
    await db.plants.insertMany([
        { name: 'Ячмень', seedType: 'barley', favorableTemp: 21, periods: {growth: [70, 90],ripening: [40, 70],aging: [93, 188]},harvestPerDay: 20 },
        { name: 'Пишеничка', seedType: 'wheat', favorableTemp: 23, periods: {growth: [70, 90],ripening: [50, 80],aging: [120, 220]},harvestPerDay: 30 },
        { name: 'Кукуруза', seedType: 'corn', favorableTemp: 25, periods: {growth: [95, 120],ripening: [52, 68],aging: [93, 168]},harvestPerDay: 10 }
    ]);


    const RANGE = 100;
    const options = {
        octaveCount: 5,
        amplitude: 0.3,
        persistence: 0.7
    };
    const noiseGround = perlin.generatePerlinNoise(RANGE, RANGE, options);//.map((el) => el * 100);
    const noiseWater = perlin.generatePerlinNoise(RANGE, RANGE, options);//.map((el) => el * 100);

    let currentX = 0;
    let currentY = 0;
    const arrayGround = [];
    const arrayWater = [];
    const toDb = [];

    for (let i = 0; i < RANGE * RANGE; i++) {
        if (!arrayGround[currentX]) arrayGround[currentX] = [];
        if (!arrayWater[currentX]) arrayWater[currentX] = [];

        arrayGround[currentX][currentY] = noiseGround[i];
        arrayWater[currentX][currentY] = noiseWater[i];

        toDb.push({
            position: [currentX, currentY],
            fertility: noiseGround[i],
            water: noiseWater[i],
            totalSpace: randomIntFromInterval(50, 150),
            availableSpace: randomIntFromInterval(10, 15),
            sectors: {},
        });

        currentY++;

        if(currentY === RANGE) {
            currentY = 0;
            currentX++;
        }
    }

    await db.regions.deleteMany({});
    await db.regions.insertMany(toDb);
})();
