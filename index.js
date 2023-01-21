// Реализуем статистику за день, типо кто за игровой год больше урожая собрал
// может быть потом сделаем возможность покупать поля и сдавать их в аренду
// тоже самое с техникой
SECOND = 1000;
MINUTE = 60 * SECOND;
HOUR = 60 * MINUTE;
DAY = 24 * HOUR;
WEEK = 7 * DAY;
MONTH = 30 * DAY;
YEAR = 12 * MONTH;

TICK_DURATION = SECOND;
DAY_DURATION = 1; // длительность игрового дня в тиках

ECONOMY_PERIOD = 7; // DAYS

const configureContainer = require('./infra/container');
const jwt = require("jsonwebtoken");


/*
* В роутерах должны быть проверки на наличие параметров
* В контроллерах должна быть бизнес логика, тут мы доверяем всем входяхим параметрам
* в сервисах должны быть обращения к базе данных
*
* такой подход позволит тестировать контроллеры отдельно и использовать их в роутере и в сокетах
*
* */
configureContainer().then((container) => {

    const { server, config, io, world, sectorsService, productService, userService } = container.cradle;

    setInterval(world.tick, world.getTickDuration())


    setInterval(async () => {

        const times = world.getInfo();
        const products = await productService.findProducts();

        // TODO вынести актуальные цены в отдельную коллекцию, и пересчитывать при обновлении экономики
        const actualPrices = {};

        (await productService.findProducts()).forEach((product) => {
            actualPrices[product.name] = world.economy.getActualPrice( product.baseSellPrice );
        });

        const resObject = {
            actualPrices,
            priceFactor: world.economy.getPriceFactor(),
            ...times,
            temp: world.weather.getDayTemp(times.dayOfYear),
            entities: { products }
        };

        io.emit('update', {action: 'world', data: resObject});
    }, 1000);

    io.on('connection', async (socket) => {
        /*
        * прокидывать как то сокет, или хранить список сокетов.
        * и при изменении данных игрока - отправлять данные ему,
        * при изменении глобального чего-то - бродкастить всем
        * */
        console.log('CONNECT', socket.handshake.auth);
        const token = socket.handshake.auth.token;
        const decodedToken = jwt.decode(token);

        if (!decodedToken.login)
            return;

        const user = await userService.findUserByLogin(decodedToken.login)

        try {
            jwt.verify(token, user.pass);
        } catch (e) {
            return;
        }

        setInterval(async () => {

            const sectors = await sectorsService.getUserSectors(user._id);

            delete user.pass;

            socket.emit('update', { action: 'user', data: {sectors, user}});
        }, 1000);
    });

    server.listen(config.port, async () => {
        console.log(`Server listening at http://localhost:${config.port}`)
    });

});

