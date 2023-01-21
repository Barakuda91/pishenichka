module.exports = {
    env: process.env.NODE_ENV || 'dev',
    port: process.env.PORT || 1995,
    tokenSecretKey: process.env.TOKEN_SECRET_KEY || 'msu73tgks23',

    defaultLang: 'ru',
    ioPath: 'ru',
    cookieMaxAge: 60 * 60 * 24 * 1000 * 365,
    dirname: '/var/www/pishenichka'

}
