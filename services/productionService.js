
module.exports = ({ productions, config }) => {
    return {
        getProduction: async _id => productions.findOne({ _id }),
        findProduction: async _id => productions.findOne({ _id }).lean().exec(),

        getProductionBySector: async sectorId => productions.findOne({ sectorId }),
        findProductionBySector: async sectorId => productions.findOne({ sectorId }).lean().exec(),

        getWorkedProductions: async sectorId => productions.find({ cycles: { $exists:true }}),
        findWorkedProductions: async sectorId => productions.find({ cycles: { $exists:true }}).lean().exec(),

        updateProduct: async (_id, data) => productions.updateOne({ _id }, data),

        createProduction: async production => productions.create(production),
    }
}
