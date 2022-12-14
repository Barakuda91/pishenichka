
module.exports = ({ users, sectors, config }) => {
    return {
        createSector: async sector => sectors.create(sector),
        updateSector: async (_id, data) => sectors.updateOne({ _id }, data),
        getSectors: async () => sectors.find({ }).lean().exec(),
        getSector: async _id => sectors.findOne({ _id }),
        findSector: async _id => sectors.findOne({ _id }).lean().exec(),
        deleteSector: async _id => sectors.deleteOne({ _id }),
        getUserSectors: async ownerId => sectors.find({ ownerId }).lean().exec(),
        getRegionSectors: async parentRegion => sectors.find({ parentRegion }).lean().exec()
    }
}
