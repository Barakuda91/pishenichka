
module.exports = ({ productions_list, config }) => {
    return {
        getProductionList: async () => productions_list.find(),
        findProductionList: async () => productions_list.find().lean().exec(),
        getProductionByName: async name => productions_list.findOne({ name }),
        findProductionByName: async name => productions_list.findOne({ name }).lean().exec(),
    }
}
