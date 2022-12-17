
module.exports = ({ products, config }) => {
    return {
        getProduct: async _id => products.findOne({ _id }),
        findProduct: async _id => products.findOne({ _id }).lean().exec(),

        findProductByName: async name => products.findOne({ name }).lean().exec(),

        findProducts: async () => products.find({ }).lean().exec(),
    }
}
