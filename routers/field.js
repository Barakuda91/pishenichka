const express = require('express');
const router = express.Router();

const Plant = require('../lib/entities/Plant');

const { messages } = require('../lib/tools');

module.exports = ({ sectorsService, userService, seedsService, plantService, localisation, config }) => {

    router.post('/sow', async (req, res, next) => {

        try {
            const field = await sectorsService.getSector(req.body.id);
            const user = await userService.getUser(req.user._id);

            if (field.ownerId.toString() !== user._id.toString())
                return res.json({error: 'Это не ваше поле'});

            const seed = await seedsService.findSeedByType(req.body.seedType);

            if (!seed)
                return res.json({error: 'Не правильно указан тип семян'});

            if (req.body.quantity > field.size)
                req.body.quantity = field.size;

            if (req.user.warehouse.seeds[seed.type] < req.body.quantity)
                return res.json({error: 'Не хватает семян'});

            const ed = await plantService.getPlantBySeedType(seed.type);
            const plantInstance = (new Plant())
                .create(ed);

            field.crop = plantInstance.saveToFile();

            user.warehouse.seeds[seed.type] -= req.body.quantity;
            field.filed = req.body.quantity;

            await user.save();
            user.markModified('warehouse');
            await field.save();
        } catch (e) {
            next(e);
        }
    });

    router.post('/harvest', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);

        if (field.ownerId.toString() !== req.user._id.toString())
            return res.json({ error: 'Это не ваше поле' });

        if (!field.crop)
            return res.json({ error: 'Это поле не засеяно' });

        if (field.crop.period !== 'AGING')
            return res.json({ error: 'Урожай не созрел' });

        // if (!user.warehouse)
        //     user.warehouse = { harvest: {}, };
        //
        // if (!user.warehouse.harvest[field.crop.seedType])
        //     user.warehouse.harvest[field.crop.seedType] = 0;

        const amount = field.crop.currentHarvest * field.filed;

        req.user.warehouse.harvest[field.crop.seedType] += amount;
        field.crop = null;

        await userService.updateUser(req.user._id, { $set: { 'warehouse.harvest': req.user.warehouse.harvest }});
        await field.save();

        res.json({ code: 200, text: `Урожай собран` });
    });

    router.post('/clear', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);

        if (field.ownerId.toString() !== req.user._id.toString())
            return res.json({ error: 'Это не ваше поле' });

        field.crop = null;

        await field.save();

        res.json({ code: 200, text: 'Поле очищено' });
    });

    router.post('/unrent', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);

        if (field.ownerId.toString() !== req.user._id.toString())
            return res.json({ error: 'Это не ваше поле' });

        field.ownerId = null;
        field.status = 'EMPTY';
        field.daysBeforePayment = null;

        await field.save();

        res.json({ code: 200, text: 'Поле больше не в аренде' });
    });

    router.post('/rent', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);
        const user = await userService.getUser(req.user._id);

        const price = economy.getActualPrice(field.rentPrice);

        if (field.ownerId)
            return res.json({ error: 'Это поле занято' });
        if (price > req.user.balance)
            return res.json({ error: 'У вас не достаточно денег' });

        user.balance -= price;
        field.ownerId = req.user._id;
        field.establishedPrice = price;
        field.status = 'RENT';
        field.daysBeforePayment = 365;

        await field.save();
        await user.save();

        res.json({ code: 200, texts: [messages.textSpent(price), 'Арендовано новое поле']});
    });

    router.post('/buy', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);
        const user = await userService.getUser(req.user._id);
        const price = world.economy.getActualPrice(field.salePrice);

        if (field.ownerId)
            return res.json({ error: 'Это поле занято' });

        if (price > user.balance)
            return res.json({ error: 'У вас не достаточно денег' });

        user.balance -= price;
        field.ownerId = user._id;
        field.status = 'BOUGHT';
        field.type = 'FIELD';

        await field.save();
        await user.save();

        res.json({ code: 200, text: messages.textSpent(price) });
    });

    router.post('/sell', async (req, res) => {
        const field = await sectorsService.getSector(req.body.id);
        const user = await userService.getUser(req.user._id);
        const price = economy.getActualPrice(field.salePrice);

        if (field.ownerId.toString() !== user._id.toString())
            return res.json({ error: 'Это не ваше поле' });

        user.balance += price;
        field.owner = null;
        field.status = null;

        await field.save();
        await user.save();

        res.json({ code: 200, text: messages.textReceived(price)});
    });

    return router;
}
