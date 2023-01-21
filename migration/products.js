const DB = require('../lib/DB');

const db = new DB();

(async () => {
    await db.init();

    await db.products.deleteMany({});
    await db.products.insertMany([
        { title: 'PRODUCT_WHEAT_SEED', name: 'wheat_seed', type: 'seed', isTradable: 0, baseBuyPrice: 320, baseSellPrice: 320, productionTime: 2 },
        { title: 'PRODUCT_BARLEY_SEED', name: 'barley_seed', type: 'seed', isTradable: 0, baseBuyPrice: 480, baseSellPrice: 480, productionTime: 2 },
        { title: 'PRODUCT_CORN_SEED', name: 'corn_seed', type: 'seed', isTradable: 0, baseBuyPrice: 560, baseSellPrice: 560, productionTime: 2 },

        { title: 'PRODUCT_WHEAT', name: 'wheat', type: 'cereals', isTradable: 1, baseBuyPrice: 0.1, baseSellPrice: 0.1, productionTime: 2 },
        { title: 'PRODUCT_BARLEY', name: 'barley', type: 'cereals', isTradable: 1, baseBuyPrice: 0.3, baseSellPrice: 0.3, productionTime: 2 },
        { title: 'PRODUCT_CORN', name: 'corn', type: 'cereals', isTradable: 1, baseBuyPrice: 0.6, baseSellPrice: 0.6, productionTime: 2 },

        { title: 'PRODUCT_WHEAT_FLOUR', name: 'wheat_flour', type: 'flour', isTradable: 1, baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },
        { title: 'PRODUCT_BARLEY_FLOUR', name: 'barley_flour', type: 'flour', isTradable: 1, baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },
        { title: 'PRODUCT_CORN_FLOUR', name: 'corn_flour', type: 'flour', isTradable: 1, baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },

        { title: 'PRODUCT_GRAPE_ISABELLA', name: 'grape_isabella', type: 'grape', isTradable: 1, baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },
        { title: 'PRODUCT_BUSH_ISABELLA', name: 'bush_isabella', type: 'seed', isTradable: 1, baseBuyPrice: 80, baseSellPrice: 80, productionTime: 2 },
    ]);

})();
