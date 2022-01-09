const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

router.post('/get_my', async (req, res) => {

    const regions = await req.db.regions.find({ ownerId: req.user._id }).lean().exec();
    for(const index in regions) {
        regions[index].sectors = await req.db.sectors.find({ parentRegion: regions[index]._id});
    }

    res.json({ code: 200, data: regions });
});

module.exports = router;
