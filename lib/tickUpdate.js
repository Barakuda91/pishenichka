const Plant = require("./entities/Plant");

module.exports = ({
                      sectorsService,
                      userService,
                      economy,
                      weather,
                      config,
                  }) => {

    // let currentTime = Date.now()
    // Устанавливаем время начала отсчета, берём -13 лет от эпохи юникс
    // установим что один тик равен 1 часу, при тике раз в секунду реального времени
    // год будет длиться примерно 2.5 часа реального времени.
    // То есть за сутки будет проходить примерно 10ть лет, что приемлемо для тестового режима

    let currentTime = -13 * 365 * 24 * 60 * 60 * 1000;
    let currentDay = 1;
    let currentYear = 2000;
    let lastFormatTime = {};

    const TICK_DURATION = 24 * 60 * 60 * 1000;
    const ECONOMY_PERIOD = 7;

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
        getInfo: () => getFormatTime(currentTime),
        tick: async () => {
            currentTime += TICK_DURATION;
            const formatTime = getFormatTime(currentTime);
            const sectors = await sectorsService.getSectors();

            if (formatTime.dayOfYear > lastFormatTime.dayOfYear) {
                // новый день
                console.log('// новый день');
                const temp = weather.getDayTemp(formatTime.dayOfYear);

                for (const id in sectors) {
                    if (sectors[id].crop) {
                        const plant = (new Plant()).createFromFIle(sectors[id].crop);

                        plant.newDay(temp);

                        await sectorsService.updateSector(sectors[id]._id, { $set: { crop: plant.saveToFile()}});
                    }

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
