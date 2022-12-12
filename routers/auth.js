const express = require('express');
const { SHA256 } = require("crypto-js");
const jwt = require('jsonwebtoken');

const router = express.Router();

const { messages, randomIntFromInterval } = require('../lib/tools');

router.get('/', (req, res) => {
    res.sendFile('views/auth.html', { root: '/var/www/pishenichka/' });
});

router.post('/reg', async (req, res) => {
    console.log(req.method, req.body);

    const user = await req.db.users.findOne({
        login: req.body.login
    });

    if (user)
        return res.json({ code: 401, message: 'логин занят' });

    const created = await req.db.users.create({
        login: req.body.login,
        balance: randomIntFromInterval(10000, 30000),
        pass: SHA256(req.body.pass).toString()
    });

    const token = jwt.sign({
        _id: created._id,
        login: req.body.login,
        pass: SHA256(req.body.pass).toString()
    }, 'volvo');

    return res
        .cookie('auth', token, {maxAge: 60 * 60 * 24 * 1000 * 365, httpOnly: false})
        .json({ code: 200 });
});

router.post('/login', async (req, res) => {

    const user = await req.db.users.findOne({
        login: req.body.login
    });

    if (!user)
        return res.json({ code: 401, message: 'No such user' });

    if (user.pass === SHA256(req.body.pass1).toString()) {
        const token = jwt.sign({
            _id: user._id,
            login: req.body.login,
            pass: SHA256(req.body.pass).toString()
        }, 'volvo');

        return res
        .cookie('auth', token, { maxAge: 60 * 60 * 24 * 1000 * 365, httpOnly: false })
        .json({ code: 200 });
    } else
        return res.json({ code: 401 });
});

module.exports = router;
