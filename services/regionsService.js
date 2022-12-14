
module.exports = ({ regions, config }) => {
    return {
        getUserRegions: async ownerId => regions.find({ ownerId } ),
        findUserRegions: async ownerId => regions.find({ ownerId } ).lean().exec(),
        getRegion: async _id => regions.findOne({ _id }),
        findRegion: async _id => regions.findOne({ _id }).lean().exec(),
    }
}
