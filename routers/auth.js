const express = require('express');
const { SHA256 } = require("crypto-js");

const router = express.Router();

const { randomIntFromInterval } = require('../lib/tools');

module.exports = ({ userService, localisation, config }) => {

    // TODO client
    router.get('/', (req, res) => {
        res.sendFile('views/auth.html', { root: '/var/www/pishenichka/' });
    });

    router.post('/registration', async (req, res) => {
        const { login, password1, password2 } = req.body;
        const _ = localisation(config.defaultLang);

        const user = await userService.findUserByLogin(login);

        if (user)
            return res.json({ code: 401, message: _('LOGIN_NOT_AVAILABLE') });

        if (password1 !== password2)
            return res.json({ code: 401, message: _('PASSWORDS_DO_NOT_MATCH') });

        const newUser = await userService.createUser({
            login,
            balance: randomIntFromInterval(10000, 30000),
            pass: userService.makePass(password1)
        });

        return res
            .cookie('auth', userService.getUserToken(newUser), { maxAge: config.cookieMaxAge, httpOnly: false})
            .json({ code: 200 });
    });

    router.post('/login', async (req, res) => {
        const { login, password } = req.body;
        const _ = localisation(config.defaultLang);

        const user = await userService.findUserByLogin(login);

        if (!user)
            return res.json({ code: 401, message: _('USER_NOT_FOUND') });

        if (user.pass !== userService.makePass(password))
            return res.json({ code: 401, message: _('WRONG_PASSWORD') });

        return res
            .cookie('auth', userService.getUserToken(user), { maxAge: config.cookieMaxAge, httpOnly: false })
            .json({ code: 200 });
    });

    return router;
}
