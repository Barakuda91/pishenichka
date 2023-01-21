const jwt = require("jsonwebtoken");

module.exports = ({
                      sectorsService,
                      userService,
                      productService,
                      productionService,
                      productionListService,

                      localisation,
                      world,
                      config
}) => {

    let _ = localisation(config.defaultLang);

    return {
        auth: async (req, res, next) => {
            if (!req.cookies.auth)
                return res.json({ code: 400, message: _('NO_AUTH_TOKEN') });

            const decodedToken = jwt.decode(req.cookies.auth);

            if (!decodedToken.login)
                return res.json({ code: 400, message: _('WRONG_AUTH_TOKEN') });

            const user = await userService.findUserByLogin(decodedToken.login)

            try {
                jwt.verify(req.cookies.auth, user.pass);
            } catch (e) {
                return res.json({ code: 400, message: _('WRONG_AUTH_TOKEN') });
            }

            req.user = user;

            next();
        },

        user: async (req, res, next) => {

            req.user.sectors = await sectorsService.getUserSectors(req.user._id);

            // заполняем список производств
            for (const product in req.user.warehouse) {
                if (!req.user.warehouse[product])
                    delete req.user.warehouse[product]
            }

            for (const sector of req.user.sectors) {
                // if (sector.type === 'BUILD' && !sector.isFree) {
                if (!sector.isFree) {
                    sector.production = await productionService.findProductionBySector(sector._id);

                    if (sector.production)
                        sector.production.entity = await productionListService.findProductionByName(sector.production.productionName);
                }
            }

            req.world = world;

            next();

        }
    }
}

