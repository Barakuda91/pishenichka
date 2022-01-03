function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const messages = {
    textSpent: (amount) => `Списано с баланса ${amount.toFixed(0)}`,
    textReceived: (amount) => `Получено на баланс ${amount.toFixed(0)}`
};

module.exports = { randomIntFromInterval, messages };
