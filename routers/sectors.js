const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

module.exports = ({ regionsService, sectorsService, localisation, config }) => {

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
                ownerId: req.user._id
            };

            region.availableSpace -= sector.size;
            if (sector.separate) {
                region.totalSpace -= sector.size;
                createObj.parentRegion = null;
            }

            await sectorsService.createSector(createObj);
        }

        await region.save();
        res.json({ code: 200 });
    });

    return router;
}
