
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
//TODO это вынести в настройку юзера, и добавить по умолчанию значенеи
const current_lang = 'ru';
// это вынести в отдельные файлы, или в бд. логичнее сделать сервис, который может работать и на файлах и через бд
const LANG = {
    ru:{
        BALANCE_WINDROW: 'Списано с баланса',
        BALANCE_RECEIVED: 'Поступило на баланс',
    }
};

const messages = {
    textSpent: (amount) => `${LANG[current_lang].BALANCE_WINDROW} ${ amount.toFixed(0) }`,
    textReceived: (amount) => `${LANG[current_lang].BALANCE_RECEIVED}  ${ amount.toFixed(0) }`
};

function sortByPrice(arr, desc = -1) {
    return arr.sort((a, b) => a.price > b.price ? 1 * desc : -1 * desc);
}

module.exports = { randomIntFromInterval, messages, sortByPrice };
