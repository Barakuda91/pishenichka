// Реализуем статистику за день, типо кто за игровой год больше урожая собрал
// может быть потом сделаем возможность покупать поля и сдавать их в аренду
// тоже самое с техникой

const configureContainer = require('./infra/container');

configureContainer().then((container) => {

    const { server, config } = container.cradle;

    server.listen(config.port, async () => {
        console.log(`Server listening at http://localhost:${config.port}`)
    });

});

