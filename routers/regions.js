const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

module.exports = ({ regionsService, sectorsService, localisation, config }) => {
    router.post('/research', async (req, res) => {
        const region = await regionsService.findRegion(req.body.id);

        if (region.ownerId.toString() !== req.user._id.toString())
            return res.json({ error: 'Это не ваш регион' });

        // const agronomist = await researchesService.findResearches(req.body.agronomistId);

        if (agronomist.ownerId.toString() !== req.user._id.toString())
            return res.json({ error: 'Вы не нанимали этого агронома' });

        const researchList = {
            sizing: { duration: 10 },
            geodesy: { duration: 7 },
            fertility: { duration: 4 },
        };
        const research = {
            type: req.body.researchType, // geodesy
            duration: researchList[req.body.researchType],
            timeLeft: researchList[req.body.researchType],
            timePassed: 0,
            customerId: req.user._id,
            agronomistId: req.body.agronomistId
        }
    });

    router.post('/get_my', async (req, res) => {

        const regions = await regionsService.getUserRegions(req.user._id);

        for(const index in regions) {
            regions[index].sectors = await sectorsService.getRegionSectors(regions[index]._id);
        }

        res.json({ code: 200, data: regions });
    });

    return router;
}
