
module.exports = ({ seeds, config }) => {
    return {
        getSeeds: async () => seeds.find( ),
        findSeeds: async () => seeds.find( ).lean().exec(),
        getSeedByType: async type => seeds.findOne({ type }),
        findSeedByType: async type => seeds.findOne({ type }).lean().exec(),
    }
}
