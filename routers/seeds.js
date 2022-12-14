const express = require('express');
const router = express.Router();

const { messages } = require('../lib/tools');

module.exports = ({ userService, seedsService, economy, localisation, config }) => {
    router.post('/buy', async (req, res) => {
        const seed = await seedsService.findSeedByType(req.body.seedType);
        const user = await userService.getUser( req.user._id);

        req.body.quantity = Number(req.body.quantity);
        const price = economy.getActualPrice(seed.salePrice * req.body.quantity);

        if (!seed)
            return res.json({ error: 'Не правильно указан тип семян' });

        if (price > user.balance)
            return res.json({ error: 'У вас не достаточно денег' });

        user.balance -= price;

        if (!user.warehouse)
            user.warehouse = { seeds: {}, };

        if (!user.warehouse.seeds[req.body.seedType])
            user.warehouse.seeds[req.body.seedType] = 0;

        user.warehouse.seeds[req.body.seedType] += req.body.quantity;
        user.markModified('warehouse');

        await user.save();

        res.json({ code: 200, text: messages.textSpent(price) });
    });

    return router;
}
