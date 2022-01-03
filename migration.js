
const DB = require('./lib/DB');
const db = new DB();

(async () => {
    await db.init();

    await db.fields.deleteMany({});
    await db.fields.insertMany([
        { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 19, isFree: true, rentPrice: 4750, salePrice: 199500, status: 'EMPTY', filed: 0 },
        { buildings: { garage: { lv: 0 }, elevator: { lv: 3 }, irrigationComplex: { lv: 2 }, assembler: { lv: 0 }, emitter: { lv: 3 }}, size: 32, isFree: true, rentPrice: 8000, salePrice: 336000, status: 'EMPTY', filed: 0 },
        { buildings: { garage: { lv: 0 }, elevator: { lv: 0 }, irrigationComplex: { lv: 0 }, assembler: { lv: 0 }, emitter: { lv: 0 }}, size: 59, isFree: true, rentPrice: 14750, salePrice: 619500, status: 'EMPTY', filed: 0 },
        { buildings: { garage: { lv: 2 }, elevator: { lv: 3 }, irrigationComplex: { lv: 1 }, assembler: { lv: 1 }, emitter: { lv: 2 }}, size: 78, isFree: true, rentPrice: 19500, salePrice: 819000, status: 'EMPTY', filed: 0 }
    ]);

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
})();
