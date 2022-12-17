const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

module.exports = ({ userService, localisation, config }) => {
    // router.post('/sell', async (req, res) => {
    //     if (req.user.warehouse[req.body.harvestType] <= 0)
    //         return res.json({ error: 'Нечего продавать' });
    //
    //     if (req.body.quantity > req.user.warehouse[req.body.harvestType])
    //         req.body.quantity = req.user.warehouse[req.body.harvestType];
    //
    //     if (!req.actualPrices[req.body.harvestType])
    //         return res.json({ error: 'Цена на найдена' });
    //
    //
    //     const price = req.actualPrices[req.body.harvestType] * req.body.quantity;
    //     req.user.warehouse[req.body.harvestType] -= req.body.quantity;
    //
    //     await userService.updateUser(req.user._id, {
    //             $inc: { balance: price },
    //             $set: { 'warehouse': req.user.warehouse }
    //         });
    //
    //     res.json({ code: 200, text: messages.textReceived(price)});
    // });

    return router;
}
