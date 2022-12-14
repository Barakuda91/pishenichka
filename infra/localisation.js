const translator = {
    ru: require('../lang/ru.json'),
    en: require('../lang/en.json')
};

module.exports = ({ }) => {
    return (lang) => {
        return (key) => translator[lang] && translator[lang][key] ? translator[lang][key] : `${lang}: ${key}`;
    }
}
