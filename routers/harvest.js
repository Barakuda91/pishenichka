const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

router.post('/sell', async (req, res) => {
    if (req.user.warehouse.harvest[req.body.harvestType] <= 0)
        return res.json({ error: 'Нечего продавать' });

    if (req.body.quantity > req.user.warehouse.harvest[req.body.harvestType])
        req.body.quantity = req.user.warehouse.harvest[req.body.harvestType];

    const price = req.actualPrices[req.body.harvestType] * req.body.quantity;
    req.user.warehouse.harvest[req.body.harvestType] -= req.body.quantity;

    await req.db.users.updateOne(
        {
            _id: req.user._id
        }, {
            $inc: { balance: price },
            $set: { 'warehouse.harvest': req.user.warehouse.harvest }
        });

    res.json({ code: 200, text: messages.textReceived(price)});
});

module.exports = router;
