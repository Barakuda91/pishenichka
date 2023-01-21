const express = require('express');
const router = express.Router();

const { messages } = require('../lib/tools');

module.exports = ({ userService, productService, localisation, config }) => {
    router.post('/buy', async (req, res) => {
        const product = await productService.findProductByName(req.body.productName);

        if (!product)
            return res.json({ error: 'Не правильно указан тип продукта' });

        req.body.quantity = Number(req.body.quantity);
        const price = req.world.economy.getActualPrice(product.baseBuyPrice * req.body.quantity);

        if (price > req.user.balance)
            return res.json({ error: 'У вас не достаточно денег' });

        req.user.balance -= price;

        if (!req.user.warehouse)
            req.user.warehouse = { };

        if (!req.user.warehouse[product.name])
            req.user.warehouse[product.name] = 0;

        req.user.warehouse[product.name] += req.body.quantity;
        // user.markModified('warehouse');

        // await userService.updateUser(req.user._id, {$set: {
        //     balance: req.user.balance,
        //     warehouse: req.user.warehouse
        // }});

        await userService.updateUser(req.user._id, {
            $inc: { balance: -price },
            $set: { 'warehouse': req.user.warehouse }
        });

        res.json({ code: 200, text: messages.textSpent(price) });
    });

    router.post('/sell', async (req, res) => {
        if (req.user.warehouse[req.body.productName] <= 0)
            return res.json({ error: 'Нечего продавать' });

        if (req.body.quantity > req.user.warehouse[req.body.productName])
            req.body.quantity = req.user.warehouse[req.body.productName];

        if (!req.actualPrices[req.body.productName])
            return res.json({ error: 'Цена на найдена' });


        const price = req.actualPrices[req.body.productName] * req.body.quantity;
        req.user.warehouse[req.body.productName] -= req.body.quantity;

        await userService.updateUser(req.user._id, {
            $inc: { balance: price },
            $set: { 'warehouse': req.user.warehouse }
        });

        res.json({ code: 200, text: messages.textReceived(price)});
    });

    return router;
}
