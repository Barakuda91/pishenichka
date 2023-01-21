const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
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
                      orderRouter,

                      middlewares,

                      sectorsService,
                      productService,

                      world,
                      config,
                  }) => {


    const app = express();
    const { auth, user } = middlewares;

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.static('node_modules/bootstrap/dist'));
    app.use(express.static('node_modules/bootstrap-vue/dist'));
    app.use(express.static('node_modules/vue-select/dist'));
    app.use(express.static('node_modules/vue/dist'));
    app.use(express.static('node_modules/socket.io/client-dist'));
    app.use(express.static('views/public'));

    app.use('/auth', authRouter);

    app.use('/field', auth, user, fieldRouter);
    app.use('/regions', auth, user, regionsRouter);
    app.use('/sectors', auth, user, sectorsRouter);
    app.use('/product', auth, user, productRouter);
    app.use('/production', auth, user, productionRouter);
    app.use('/order', auth, user, orderRouter);

    // Всё что ниже должно уехать на фронт
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
            const exchange = (await fs.readFile(`${ops.root}/views/indexParts/exchange.html`)).toString();

            // если это станет узким местом - можно внедрить генератор переменной и перегенеривать её с каким то промежутком
            res.send(file
                .replace('<templates_top_line />', topLine)
                .replace('<templates_warehouse />', warehouse)
                .replace('<templates_fields />', fields)
                .replace('<templates_exchange />', exchange)
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

    // app.post('/get_update', auth, user, async (req, res) => {
    //
    //     const times = world.getInfo();
    //     const sectors = await sectorsService.getUserSectors(req.user._id);
    //     const products = await productService.findProducts();
    //
    //     const resObject = {
    //         actualPrices: req.actualPrices,
    //         priceFactor: world.economy.getPriceFactor(),
    //         ...times,
    //         temp: world.weather.getDayTemp(times.dayOfYear),
    //         entities: { sectors, products }
    //     };
    //
    //     if (req.user) {
    //         resObject.user = req.user;
    //         delete resObject.user.pass;
    //     }
    //
    //     res.json(resObject);
    // });

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).json({
            error: 'Server error'
        });
    })

    return app;
}
