
module.exports = ({ researches, config }) => {
    return {
        getResearches: async _id => researches.findOne({ _id }),
        findResearches: async _id => researches.findOne({ _id }).lean().exec(),
    }
}
