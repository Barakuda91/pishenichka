const Plant = require("./entities/Plant");

module.exports = ({
                      sectorsService,
                      userService,
                      productionService,

                      economy,
                      weather,
                      config,
                  }) => {

    // let currentTime = Date.now()
    // Устанавливаем время начала отсчета, берём -13 лет от эпохи юникс
    // установим что один тик равен 1 часу, при тике раз в секунду реального времени
    // год будет длиться примерно 2.5 часа реального времени.
    // То есть за сутки будет проходить примерно 10ть лет, что приемлемо для тестового режима
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 12 * MONTH;

    const TICK_DURATION = SECOND;
    const DAY_DURATION = 4; // длительность игрового дня в тиках

    const ECONOMY_PERIOD = 7; // DAYS

    let currentTime = -13 * YEAR;
    let currentDay = 1;
    let lastFormatTime = {};

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };

    function getFormatTime (ct) {
        const date = new Date(ct);

        return {
            dayOfMonth: date.getDate(),
            dayOfWeek: date.getDay() === 0 ? 7 : date.getDay(),
            dayOfYear: (date.getMonth() * 30) + date.getDate(),
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            isoString: date.toLocaleString("ru", options)
        }
    }

    return {
        getTickDuration: () => TICK_DURATION,
        getInfo: () => getFormatTime(currentTime),
        tick: async () => {
            currentTime += (DAY / DAY_DURATION);
            const formatTime = getFormatTime(currentTime);
            // выгребаем секторы чтоб увеличить рост пшеницы и прочего говна,
            // но как раз сейчас я переделываю всю эту хуйню на работу через табличку производств
            const sectors = await sectorsService.getSectors();

            if (formatTime.dayOfYear > lastFormatTime.dayOfYear) {
                // новый день
                console.log('// новый день');
                const temp = weather.getDayTemp(formatTime.dayOfYear);

                for (const id in sectors) {
                    // рост культур
                    if (sectors[id].crop) {
                        const plant = (new Plant()).createFromFIle(sectors[id].crop);

                        plant.newDay(temp);

                        await sectorsService.updateSector(sectors[id]._id, { $set: { crop: plant.saveToFile()}});
                    }

                    // работает с арендой
                    if (sectors[id].status === 'RENT') {
                        if (sectors[id].daysBeforePayment <= 1) {

                            const user = await userService.getUser(sectors[id].ownerId);

                            if (user.balance >= sectors[id].rentPrice || sectors[id].crop) {
                                user.balance -= sectors[id].establishedPrice;
                                await user.save();
                                await sectorsService.updateSector(sectors[id]._id, { $set: { daysBeforePayment: 365 }});
                            } else {
                                await sectorsService.updateSector(sectors[id]._id, { $set: {
                                    daysBeforePayment: null,
                                    ownerId: null,
                                    status: 'EMPTY'
                                }});
                            }
                        } else
                            await sectorsService.updateSector(sectors[id]._id, { $inc: { daysBeforePayment: -1 }});
                    }

                    // ВОТ ТУТ ДОЛЖНА НАЧАТЬСЯ НОВАЯ ЖИЗНЬ - делаем производства
                    const productions = await productionService.findWorkedProductions();

                    for (const production of productions) {
                        const user = await userService.findUser(production.userId);
                        for(const cycleId in production.cycles) {
                            const cycle = production.cycles[cycleId];

                            if (user.balance < cycle.cost)
                                return;

                            //             длит.дня/кол-во тиков
                            // currentTime += (DAY / DAY_DURATION);
                            // длительность тика TICK_DURATION
                            // DAY_DURATION * TICK_DURATION = время одного дня!
                            // cycle.cycleDuration = игровых дней дней = 1
                            const cycleDuration = ((DAY_DURATION * TICK_DURATION) * cycle.cycleDuration);
                            // выясняем сколько периодов прошло
                            // cycleDuration - длительность одного периода
                            const fromTheStart = Date.now() - cycle.startCycle;
                            const periodsPassed = Math.floor(fromTheStart / cycleDuration); // количество периодов

                            if (!periodsPassed)
                                return;

                            for (const product in cycle.inputProducts) {

                                if (!user.warehouse[product] || user.warehouse[product] < cycle.inputProducts[product])
                                    return;

                                user.warehouse[product] -= cycle.inputProducts[product];

                            }

                            for (const product in cycle.outputProducts) {
                                if (!user.warehouse[product])
                                    user.warehouse[product] = cycle.outputProducts[product];
                                else
                                    user.warehouse[product] += cycle.outputProducts[product];
                            }

                            user.balance -= cycle.cost;
                            cycle.startCycle = Date.now() - (fromTheStart - (periodsPassed * cycleDuration));
                        }

                        await productionService.updateProduct(production._id, { $set: { cycles: production.cycles }});
                        await userService.updateUser(user._id, { $set: {
                            warehouse: user.warehouse,
                            balance: user.balance
                        }});
                        //     "sectorId": "639a760c520dc9b164d55794",
                        //     "productionName": "mill",
                        //     "ownerId": "625d9704f18621fcdfc7065f",
                        //     "userId": "625d9704f18621fcdfc7065f",
                        //     "cycles":
                        //         "startCycle": 1671147339407,
                        //         "cycleDuration": 1,
                        //         "inputProduct": "barley",
                        //         "inputProductAmount": 100,
                        //         "outputProduct": "flour",
                        //         "outputProductAmount": 1,
                        //         "_id": "639baf4b499f7b562d7c55c5"

                    }
                }

                if (currentDay % ECONOMY_PERIOD === 0)
                    economy.newPriceFactor();
            }

            if (formatTime.year > lastFormatTime.year) {
                console.log('Heavy New Year', formatTime.year);
                weather.reInit();
                economy.reInit();
            }

            lastFormatTime = {...formatTime}
        }
    }
}
