const DB = require('../lib/DB');

const db = new DB();

(async () => {
    await db.init();

    await db.products.deleteMany({});
    await db.products.insertMany([
        { title: 'PRODUCT_WHEAT_SEED', name: 'wheat_seed', type: 'seed', baseBuyPrice: 320, baseSellPrice: 320, productionTime: 2 },
        { title: 'PRODUCT_WHEAT', name: 'wheat', type: 'cereals', baseBuyPrice: 0.1, baseSellPrice: 0.1, productionTime: 2 },

        { title: 'PRODUCT_BARLEY_SEED', name: 'barley_seed', type: 'seed', baseBuyPrice: 480, baseSellPrice: 480, productionTime: 2 },
        { title: 'PRODUCT_BARLEY', name: 'barley', type: 'cereals', baseBuyPrice: 0.3, baseSellPrice: 0.3, productionTime: 2 },

        { title: 'PRODUCT_CORN_SEED', name: 'corn_seed', type: 'seed', baseBuyPrice: 560, baseSellPrice: 560, productionTime: 2 },
        { title: 'PRODUCT_CORN', name: 'corn', type: 'cereals', baseBuyPrice: 0.6, baseSellPrice: 0.6, productionTime: 2 },

        { title: 'PRODUCT_FLOUR', name: 'flour', type: '', baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },
    ]);

})();
