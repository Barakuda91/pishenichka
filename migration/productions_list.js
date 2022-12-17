const DB = require('../lib/DB');

const db = new DB();

(async () => {
    await db.init();

    await db.productions_list.deleteMany({});
    await db.productions_list.insertMany([
        { title: 'PRODUCTION_FIELD', type: 'FIELD', name: 'field',  stage: 1, basePrice: 1000, placeSize: 0, buildTime: 5,
            recipes: []
        }, // поле

        { title: 'PRODUCTION_VINEYARD', type: 'VINEYARD', name: 'vineyard',  stage: 1, basePrice: 2000, placeSize: 0, buildTime: 5,
            recipes: []
        }, // винодельня

        { title: 'PRODUCTION_GARDEN', type: 'GARDEN', name: 'garden',  stage: 1, basePrice: 1300, placeSize: 0, buildTime: 5,
            recipes: []
        }, // Огород

        { title: 'PRODUCTION_ORCHARD', type: 'ORCHARD', name: 'orchard',  stage: 1, basePrice: 1700, placeSize: 0, buildTime: 5,
            recipes: []
        }, // Сад

        { title: 'PRODUCTION_CORRAL', type: 'CORRAL', name: 'corral',  stage: 1, basePrice: 700, placeSize: 0, buildTime: 5,
            recipes: []
        }, // Загон для скота

        { title: 'PRODUCTION_MILL', type: 'MILL', name: 'mill',  stage: 2, basePrice: 10000, placeSize: 1, buildTime: 5, recipes: [
                {
                    name: 'wheat-flour',
                    inputProducts: { 'wheat': 100 },
                    outputProducts: { 'flour': 1 },
                    cycleDuration: 1,
                    cost: 25
                },{
                    name: 'barley-flour',
                    inputProducts: { 'barley': 100 },
                    outputProducts: { 'flour': 1 },
                    cycleDuration: 1,
                    cost: 25
                },{
                    name: 'corn-flour',
                    inputProducts: { 'corn': 100 },
                    outputProducts: { 'flour': 1 },
                    cycleDuration: 1,
                    cost: 25
                },
            ] }, // Мельница

        { title: 'PRODUCTION_WINERY', type: 'WINERY', name: 'winery',  stage: 2, basePrice: 23000, placeSize: 3, buildTime: 5,
            recipes: []
        }, // Винодельня

        { title: 'PRODUCTION_WHISKEY_DISTILLERY', type: 'WHISKEY_DISTILLERY', name: 'whiskey_distillery',  stage: 2, basePrice: 35000, placeSize: 3, buildTime: 5,
            recipes: []
        }, // Вискикурня

        { title: 'PRODUCTION_OIL_MILL', type: 'OIL_MILL', name: 'oil_mill',  stage: 2, basePrice: 31000, placeSize: 2, buildTime: 5,
            recipes: []
        }, // Маслобойня

        { title: 'PRODUCTION_SPINNING_MILL', type: 'SPINNING_MILL', name: 'spinning_mill',  stage: 2, basePrice: 19000, placeSize: 1, buildTime: 5,
            recipes: []
        }, // Прядильня

        { title: 'PRODUCTION_TANNERY', type: 'TANNERY', name: 'tannery',  stage: 2, basePrice: 9000, placeSize: 1, buildTime: 5, recipes: [
                {
                    name: 'skin-leather',
                    inputProducts: { 'skin': 1 },
                    outputProducts: { 'leather': 1 },
                    cycleDuration: 3,
                    cost: 150
                }
                ]
        }, // Дубильня

        { title: 'PRODUCTION_CANNERY', type: 'CANNERY', name: 'cannery',  stage: 2, basePrice: 230000, placeSize: 5, buildTime: 5,
            recipes: []
        }, // Консервный завод

        { title: 'PRODUCTION_LEATHER_WORKSHOP', type: 'LEATHER_WORKSHOP', name: 'leather_workshop',  stage: 3, basePrice: 63000, placeSize: 3, buildTime: 5,
            recipes: []
        }, // Кожевная мастерская

        { title: 'PRODUCTION_BAKERY', type: 'BAKERY', name: 'bakery',  stage: 3, basePrice: 160000, placeSize: 5, buildTime: 5,
            recipes: []
        }, // Хлебзавод

        { title: 'PRODUCTION_WEAVING_WORKSHOP', type: 'WEAVING_WORKSHOP', name: 'weaving_workshop',  stage: 3, basePrice: 58000, placeSize: 3, buildTime: 5,
            recipes: []
        }, // Ткацкая мастерская
    ]);

})();
