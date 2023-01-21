const { createContainer, asValue, asFunction, asClass } = require('awilix');
const DB = require('../lib/DB')

async function configureContainer () {

    const db = new DB();
    await db.init();

    const container = createContainer();

    container.register({
        config: asValue(require('../config')),

        localisation: asFunction(require('./localisation')),
        middlewares: asFunction(require('./middlewares')),
        express: asFunction(require('./express')).singleton(),
        server: asFunction(require('./server')).singleton(),
        io: asFunction(require('./io')).singleton(),

        // DB models
        users: asValue(db.users),
        plants: asValue(db.plants),
        regions: asValue(db.regions),
        researches: asValue(db.researches),
        sectors: asValue(db.sectors),
        seeds: asValue(db.seeds),
        //  world: asValue(db.world),
        products: asValue(db.products),
        orders: asValue(db.orders),
        productions: asValue(db.productions),
        productions_list: asValue(db.productions_list),

        // routers
        authRouter: asFunction(require('../routers/auth')),
        fieldRouter: asFunction(require('../routers/field')),
        regionsRouter: asFunction(require('../routers/regions')),
        sectorsRouter: asFunction(require('../routers/sectors')),
        productionRouter: asFunction(require('../routers/production')),
        productRouter: asFunction(require('../routers/product')),
        orderRouter: asFunction(require('../routers/order')),

        // services
        userService: asFunction(require('../services/userService')),
        fieldService: asFunction(require('../services/fieldService')),
        sectorsService: asFunction(require('../services/sectorsService')),
        seedsService: asFunction(require('../services/seedsService')),
        regionsService: asFunction(require('../services/regionsService')),
        plantService: asFunction(require('../services/plantService')),
        productService: asFunction(require('../services/productService')),
        productionService: asFunction(require('../services/productionService')),
        productionListService: asFunction(require('../services/productionListService')),
        orderService: asFunction(require('../services/orderService')),

        world: asFunction(require('../lib/world')),

        economy: asClass(require('../lib/entities/world/Economy')),
        weather: asClass(require('../lib/entities/world/Weather')),


    });

    return container;
}

module.exports = configureContainer;
