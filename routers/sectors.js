const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

module.exports = ({ regionsService, sectorsService, productionListService, productionService, localisation, config }) => {

    router.post('/get_production_list', async (req, res) => {
        const productionList = await productionListService.findProductionList();

        res.json({ code: 200, data: productionList });
    });

    router.post('/get_sector', async (req, res) => {
        const sector = await sectorsService.getSector(req.body.id);

        if (!sector)
            return res.json({ code: 403, text: 'Сектор не найден' });

        res.json({ code: 200, data: sector });
    });

    router.post('/delete', async (req, res) => {
        const sector = await sectorsService.getSector(req.body.id);

        if (!sector)
            return res.json({ code: 403, text: 'Сектор не найден' });

        if (!sector.parentRegion)
            return res.json({ code: 403, text: 'Сектор не имеет родительского региона' });

        const region = await regionsService.getRegion(sector.parentRegion);

        if (!region)
            return res.json({ code: 403, text: 'Регион не найден' });

        region.availableSpace += sector.size;

        await sectorsService.deleteSector({ _id: req.body.id });
        await region.save();

        res.json({ code: 200 });
    });

    router.post('/create', async (req, res) => {
        if (!req.body.id)
            return res.json({ code: 403, text: 'Не указан целевой регион' });

        const region = await regionsService.getRegion(req.body.id);

        if (!region)
            return res.json({ code: 403, text: 'Такой регион не найден' });

        if (region.ownerId.toString() !== req.user._id.toString())
            return res.json({ code: 403, text: 'Это не ваш регион' });

        let totalSize = 0;
        req.body.sectors.forEach((sector) => totalSize += Number(sector.size));

        if (totalSize > region.availableSpace)
            return res.json({ code: 403, text: 'Общая площадь секторов больше доступной' });

        for(const sector of req.body.sectors) {
            const createObj = {
                size: sector.size,
                type: sector.type,
                position: region.position,
                rentPrice: 250 * sector.size,
                salePrice: 10500 * sector.size,
                parentRegion: region._id,
                status: 'PRIVATE',
                ownerId: req.user._id,
                isFree: false
            };

            region.availableSpace -= sector.size;

            if (sector.separate) {
                region.totalSpace -= sector.size;
                createObj.parentRegion = null;
            }

            const newSector = await sectorsService.createSector(createObj);

            // если это поле - то сразу ставим производство, по сути - поле это производство изначально
            if (['VINEYARD','FIELD','GARDEN','ORCHARD','CORRAL'].includes(sector.type)) {
                const productionType = await productionListService.findProductionByName(sector.type.toLowerCase());

                const prObject = {
                    sectorId: newSector._id,
                    productionName: productionType.name,
                    ownerId: req.user._id,
                    userId: req.user._id,
                    cycles: {}
                };

                const newProduction = await productionService.createProduction(prObject);
            }
        }

        await region.save();
        res.json({ code: 200 });
    });

    return router;
}
