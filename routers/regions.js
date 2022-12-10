const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

router.post('/research', async (req, res) => {
    const region = await req.db.regions.findOne({ _id: req.body.id }).lean().exec();

    if (region.ownerId.toString() !== req.user._id.toString())
        return res.json({ error: 'Это не ваш регион' });

    const agronomist = await req.db.agronomists.findOne({ _id: req.body.agronomistId }).lean().exec();

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

    const regions = await req.db.regions.find({ ownerId: req.user._id }).lean().exec();
    for(const index in regions) {
        regions[index].sectors = await req.db.sectors.find({ parentRegion: regions[index]._id});
    }

    res.json({ code: 200, data: regions });
});

module.exports = router;
