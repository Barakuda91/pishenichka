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


    let currentTime = -13 * YEAR;
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

    async function processedField(production, sector, user) {

        for(const cycleId in production.cycles) {
            const cycle = production.cycles[cycleId];

            if (user.balance < cycle.cost * sector.size)
                return;

            const cycleDuration = ((DAY_DURATION * TICK_DURATION) * cycle.cycleDuration);
            const fromTheStart = Date.now() - cycle.startCycle;

            if (fromTheStart > cycleDuration) {

                for (const product in cycle.inputProducts) {

                    if (!user.warehouse[product])
                        return;

                    let totalProductAmount = cycle.inputProducts[product] * sector.size;

                    if (user.warehouse[product] < totalProductAmount)
                        return;

                    user.warehouse[product] -= cycle.inputProducts[product] * sector.size;
                }

                for (const product in cycle.outputProducts) {

                    let productForWarehouse = cycle.outputProducts[product] * sector.size

                    if (!user.warehouse[product])
                        user.warehouse[product] = productForWarehouse;
                    else
                        user.warehouse[product] += productForWarehouse;
                }

                user.balance -= cycle.cost * sector.size;

                cycle.startCycle = Date.now();
                cycle.cycleDurationInMs = cycleDuration;
            }
        }
    }

    async function processedBuild(production, sector, user) {

        for(const cycleId in production.cycles) {
            const cycle = production.cycles[cycleId];

            if (user.balance < cycle.cost)
                return;

            const cycleDuration = ((DAY_DURATION * TICK_DURATION) * cycle.cycleDuration);
            const fromTheStart = Date.now() - cycle.startCycle;

            if (fromTheStart > cycleDuration) {

                for (const product in cycle.inputProducts) {

                    if (!user.warehouse[product])
                        return;

                    // если нет нужного количества сырья
                    if (user.warehouse[product] < cycle.inputProducts[product])
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

                cycle.startCycle = Date.now();
                cycle.cycleDurationInMs = cycleDuration;
            }
        }
    }

    async function processedTasks(formatTime) {
        const temp = weather.getDayTemp(formatTime.dayOfYear);
        const productions = await productionService.findWorkedProductions();

        for (const production of productions) {
            const sector = await sectorsService.findSector(production.sectorId);
            const user = await userService.findUser(production.userId);

            if (sector.type === 'BUILD')
                await processedBuild(production, sector, user);
            else
                await processedField(production, sector, user);

            await productionService.updateProduct(production._id, { $set: { cycles: production.cycles }});
            await userService.updateUser(user._id, { $set: {
                    warehouse: user.warehouse,
                    balance: user.balance
                }});
        }
    }

    return {
        weather,
        economy,
        getTickDuration: () => TICK_DURATION,
        getInfo: () => getFormatTime(currentTime),
        tick: async () => {
            currentTime += (DAY / DAY_DURATION);

            const formatTime = getFormatTime(currentTime);
            if (formatTime.dayOfYear % ECONOMY_PERIOD === 0)
                economy.newPriceFactor();

            const newDay = formatTime.dayOfYear > lastFormatTime.dayOfYear;
            if (newDay)
                await processedTasks(formatTime);

            const newYear = formatTime.year > lastFormatTime.year
            if (newYear) {
                console.log('Heavy New Year', formatTime.year);
                weather.reInit();
                economy.reInit();
            }

            lastFormatTime = { ...formatTime }
        }
    }
}
