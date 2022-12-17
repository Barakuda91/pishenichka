const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
const fs = require("fs-extra");
const translator = {
    ru: require('../lang/ru.json'),
    en: require('../lang/en.json')
};
module.exports = ({
                      authRouter,
                      fieldRouter,
                      regionsRouter,
                      sectorsRouter,
                      productRouter,
                      productionRouter,

                      userService,
                      sectorsService,
                      seedsService,
                      productService,
                      productionService,
                      productionListService,

                      localisation,
                      economy,
                      weather,
                      config,
                      tickUpdate
                  }) => {

    setInterval(tickUpdate.tick, tickUpdate.getTickDuration())

    const app = express();

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.static('node_modules/bootstrap/dist'));
    app.use(express.static('node_modules/bootstrap-vue/dist'));
    app.use(express.static('node_modules/vue-select/dist'));
    app.use(express.static('node_modules/vue/dist'));
    app.use(express.static('views/public'));

    app.use(async (req, res, next) => {
        let _ = localisation(config.defaultLang);
        if (req.cookies.auth) {
            const decodedToken =  jwt.decode(req.cookies.auth);

            if (!decodedToken.login)
                return res.json({ code: 400, message: _('WRONG_AUTH_TOKEN') });

            const user = await userService.findUserByLogin(decodedToken.login)

            try {
                jwt.verify(req.cookies.auth, user.pass);
            } catch (e) {
                return res.json({ code: 401, message: _('WRONG_AUTH_TOKEN') });
            }

            req.user = user;
            req.user.sectors = await sectorsService.getUserSectors(user._id);

            // заполняем список производств
            for (const sector of req.user.sectors) {
                if (sector.type === 'BUILD' && !sector.isFree) {
                    sector.production = await productionService.findProductionBySector(sector._id);
                    if (sector.production)
                        sector.production.entity = await productionListService.findProductionByName(sector.production.productionName);
                }
            }
        }

        // req.economy = economy;

        // TODO вынести актуальные цены в отдельную коллекцию, и пересчитывать при обновлении экономики
        req.actualPrices = {};

        (await productService.findProducts()).forEach((product) => {
            req.actualPrices[product.name] = economy.getActualPrice( product.baseSellPrice );
        });

        next();
    });

    app.use('/auth', authRouter);
    app.use('/field', fieldRouter);
    //app.use('/harvest', harvestRouter);
    //app.use('/seeds', seedsRouter);
    app.use('/regions', regionsRouter);
    app.use('/sectors', sectorsRouter);
    app.use('/product', productRouter);
    app.use('/production', productionRouter);

    app.get('*', async (req, res, next) => {
        res.sendFile = async (filePath, ops) => {

            const file = (await fs.readFile(path.join(ops.root, filePath))).toString();
            const htmlDir = path.join(ops.root, '/views/templates');
            const jsDir = path.join(ops.root, '/views/public/js/components');
            const htmlFiles = await fs.readdir(htmlDir);
            const jsFiles = await fs.readdir(jsDir);

            let scripts = '';
            for(const file of jsFiles) {
                scripts += `<script src="/js/components/${file}"></script>`;
            }

            let templates = '';
            for(const file of htmlFiles) {
                templates += (await fs.readFile(`${htmlDir}/${file}`)).toString();
            }

            const topLine = (await fs.readFile(`${ops.root}/views/indexParts/topLine.html`)).toString();
            const leftMenu = (await fs.readFile(`${ops.root}/views/indexParts/leftMenu.html`)).toString();
            const warehouse = (await fs.readFile(`${ops.root}/views/indexParts/warehouse.html`)).toString();
            const fields = (await fs.readFile(`${ops.root}/views/indexParts/fields.html`)).toString();
            const transport = (await fs.readFile(`${ops.root}/views/indexParts/transport.html`)).toString();
            const production = (await fs.readFile(`${ops.root}/views/indexParts/production.html`)).toString();
            const shop = (await fs.readFile(`${ops.root}/views/indexParts/shop.html`)).toString();
            const regions = (await fs.readFile(`${ops.root}/views/indexParts/regions.html`)).toString();

            // если это станет узким местом - можно внедрить генератор переменной и перегенеривать её с каким то промежутком
            res.send(file
                .replace('<templates_top_line />', topLine)
                .replace('<templates_warehouse />', warehouse)
                .replace('<templates_fields />', fields)
                .replace('<templates_transport />', transport)
                .replace('<templates_production />', production)
                .replace('<templates_shop />', shop)
                .replace('<templates_regions />', regions)
                .replace('<templates_left_menu />', leftMenu)
                .replace('<template_htmls_components />', templates)
                .replace('<templates_js_components />', scripts));
        };

        if(!req.cookies.auth)
            return res.sendFile('views/auth.html', { root: config.dirname });
        else next();
    });

    app.get('/', (req, res) => res.sendFile('views/index.html', { root: config.dirname }));

    app.post('/get_field_factors', (req, res) => {
        res.json({
            code: 200,
            data: {
                sectorGarage: [0.08, 0.1, 0.13, 0.18, 0.25],
                sectorElevator: [0.25, 0.36, 0.47, 0.58, 0.70],
                sectorIrrigationComplex: [0.15, 0.26, 0.37, 0.48, 0.59],
                sectorAssembler: [0.09, 0.12, 0.18, 0.22, 0.38],
                sectorEmitter: [0.1, 0.21, 0.29, 0.35, 0.49],
            }
        });
    });

    app.post('/get_lang', async (req, res) => {
        res.json({ code: 200, data: translator[req.body.lang || 'ru'] });
    });

    app.post('/get_update', async (req, res) => {

        const times = tickUpdate.getInfo();
        const sectors = await sectorsService.getUserSectors(req.user._id);
        const products = await productService.findProducts();

        const resObject = {
            actualPrices: req.actualPrices,
            priceFactor: economy.getPriceFactor(),
            ...times,
            temp: weather.getDayTemp(times.currentDay),
            entities: { sectors, products }
        };

        if (req.user) {
            resObject.user = req.user;
            delete resObject.user.pass;
        }

        res.json(resObject);
    });

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).json({
            error: 'Server error'
        });
    })

    return app;
}
