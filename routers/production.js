const express = require('express');
const router = express.Router();
const { messages } = require('../lib/tools');

// function executeData(data) {
//     return {
//         status: 'OK',
//         ...data
//     };
// }
// function executeError(code, exMsg = '') {
//     return {
//         status: 'ERROR',
//         message: `${errors[code]}${exMsg ? '. ' + exMsg: ''}`,
//         error: code,
//     };
// }
module.exports = ({ userService, sectorsService, productionListService, productionService, localisation, config }) => {
    router.post('/stop_cycle', async (req, res) => {
        // [sectorId, productionId, recipeId]
        const production = await productionService.getProduction(req.body.productionId);
        if (production.ownerId.toString() !== req.user._id.toString())
            return res.json({ status: 'ERROR', message: 'Не ваша мануфактура', error: 300 });
        production.cycles = {};
        await production.save();

        return res.json({ status: 'OK', data: production });

    });

    router.post('/start_cycle', async (req, res) => {
        // [sectorId, productionId, recipeId]
        const production = await productionService.findProduction(req.body.productionId);
        const productionType = await productionListService.findProductionByName(production.productionName);

        if (production.ownerId.toString() !== req.user._id.toString())
            return res.json({ status: 'ERROR', message: 'Не ваша мануфактура', error: 300 });

        if (!productionType.recipes[req.body.recipeId])
            return res.json({ status: 'ERROR', message: 'Рецепт не найден', error: 300 });

        const rec = productionType.recipes[req.body.recipeId];

        delete rec._id;
        if (!production.cycles)
            production.cycles = {};

        production.cycles[rec.name] = {
            startCycle: Date.now(),
            ...rec
        };

        await productionService.updateProduct(production._id, { $set: { cycles: production.cycles }});
        return res.json({ status: 'OK', data: production });

    });

    router.post('/build', async (req, res) => {

        const sector = await sectorsService.getSector(req.body.sectorId);

        if (req.user._id.toString() !== sector.ownerId.toString())
            return res.json({ status: 'ERROR', message: 'Не ваш сектор', error: 300 });

        const productionType = await productionListService.findProductionByName(req.body.productionName);

        if (req.user.balance < productionType.basePrice)
            return res.json({ status: 'ERROR', message: 'Не достаточно денег', error: 300 });

        const prObject = {
            sectorId: sector._id,
            productionName: productionType.name,
            ownerId: req.user._id,
            userId: req.user._id,
            cycles: {}
        };

        const newProduction = await productionService.createProduction(prObject);
        await userService.updateUser(req.user._id, { $inc: { balance: -productionType.basePrice }})

        sector.state = 'BUSY';
        await sector.save();

        res.json({ code: 200 });
    });

    return router;
}
