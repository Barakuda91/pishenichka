const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

router.post('/create', async (req, res) => {
    console.log(req.body);
    if (!req.body.id)
        return res.json({ code: 403, text: 'Не указан целевой регион' });

    const region = await req.db.regions.findOne({ _id: req.body.id });

    if (!region)
        return res.json({ code: 403, text: 'Такой регион не найден' });

    if (region.ownerId.toString() !== req.user._id.toString())
        return res.json({ code: 403, text: 'Это не ваш регион' });

    let totalSize = 0;
    req.body.sectors.forEach((sector) => totalSize += Number(sector.size));

    if (totalSize > region.availableSpace)
        return res.json({ code: 403, text: 'Общая площать секторов больше доступной' });

    for(const sector of req.body.sectors) {
        const createObj = {
            size: sector.size,
            type: sector.type,
            position: region.position,
            rentPrice: 250 * sector.size,
            salePrice: 10500 * sector.size,
            parentRegion: region._id,
            ownerId: req.user._id
        };

        if (sector.separate) {
            region.availableSpace -= sector.size;
            region.totalSpace -= sector.size;
            createObj.parentRegion = null;
        }

        await req.db.sectors.create(createObj);
    }

    await region.save();
    res.json({ code: 200 });
});

module.exports = router;
