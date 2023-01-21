
module.exports = ({ orders, config }) => {
    return {
        addOrder: async order => orders.create(order),
        findOrder: async _id => orders.findOne({ _id }).lean().exec(),
        findBuyOrdersByProduct: async product => orders.find({ product, side: 'BUY' }).lean().exec(),
        findSellOrdersByProduct: async product => orders.find({ product, side: 'SELL' }).lean().exec(),
        getOrderbook: async product => orders.find({ product, status: { "$in" : ['NEW','PARTIALLY_FILLED','FILLED'] }}).lean().exec(),
        getByCondition: async condition => orders.find(condition).lean().exec(),
        getSpreadOrders: async product => {
            const sell = await orders.findOne({ product, side: 'SELL' }).sort('price').lean().exec();
            const buy = await orders.findOne({ product, side: 'BUY' }).sort('-price').lean().exec();
            return {sell, buy};
        },
        getOrder: async _id => orders.findOne({ _id }),
        updateOrder: async (_id, data) => orders.updateOne({ _id }, data ),
    }
}
