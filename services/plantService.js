
module.exports = ({ plants, config }) => {
    return {
        getPlant: async _id => plants.findOne({ _id }),
        findPlant: async _id => plants.findOne({ _id }).lean().exec(),
        getPlantBySeedType: async seedType => plants.findOne({ seedType }),
    }
}
