const express = require('express');
const router = express.Router();

const { messages, sortByPrice } = require('../lib/tools');

module.exports = ({ userService, orderService, localisation, config }) => {
    router.post('/new', async (req, res) => {
        const newOrderAmount = Number(req.body.amount);
        const newOrderPrice = Number(req.body.price);
        const _ = localisation(config.defaultLang);

        if (!['SELL', 'BUY'].includes(req.body.side))
            return res.json({ code: 300, message: _('ERROR_MSG_ORDER_NEW_WRONG_SIDE') });

        if (!['LIMIT','MARKET'].includes(req.body.type))
            return res.json({ code: 300, message: _('ERROR_MSG_ORDER_NEW_WRONG_TYPE') });

        if (newOrderAmount <= 0)
            return res.json({ code: 300, message: _('ERROR_MSG_ORDER_NEW_WRONG_AMOUNT') });

        if (newOrderPrice <= 0)
            return res.json({ code: 300, message: _('ERROR_MSG_ORDER_NEW_WRONG_PRICE') });

        // TODO добавить личные проверки (хватает лим бабок/товара)
        // TODO взаимоуничтожение ордера
        /*
        * если сторона - продажа, и тип маркет - то выгребаем из стакана покупки по количеству ордера из стакана
        * если сторона - продажа, и тип лимит - смотрим на цену. Если цена входит в диапазон существующих ордеров - продаем в стакан
        * если сторона - покупка, и тип маркет - то выгребаем из стакана продаж
        *
        * */

        const spread = await orderService.getSpreadOrders(req.body.product);

        if (req.body.side === 'SELL') {
            if (req.body.type === 'MARKET') {
                // берём ордера из стакана покупки (продаем тем кто хочет купить)
                const orders = await orderService.findBuyOrdersByProduct(req.body.product);
                const sortedOrders = sortByPrice(orders); // 0 - самая большая цена
                // удовлетворяем ордера

                for(const order of sortedOrders) {
                    console.log(order);
                    if (order.amount >= newOrderAmount) {
                        // если объема данного ордера хватает

                        // уменьшаем объем ордера
                        order.amount -= newOrderAmount;

                        const totalSum = order.amount * order.price; // в бапках

                        // накидываем бапки владельцу ордера
                        const resFromUserOwner = await userService.updateUser(order.owner, {
                            $inc: { balance: totalSum }
                        });

                        console.log('resFromUserOwner', resFromUserOwner);
                        // если наш ордер заполнился полностью - ставим ему статус заполнен

                        // закидываем нам на склад товар
                        if (!req.user.warehouse[order.product])
                            req.user.warehouse[order.product] = 0;
                        req.user.warehouse[order.product] += newOrderAmount;

                        // списываем с нас бапки
                        const resFromUser = await userService.updateUser(req.user._id, {
                            $inc: { balance: -totalSum },
                            $set: { warehouse: req.user.warehouse }
                        });
                        console.log('resFromUser', resFromUser);

                        // обновляем ордер
                        await orderService.updateOrder(order._id, {
                            $set: {
                                amount: order.amount,
                                status: order.status
                            }
                        });

                        return ;
                        // написать функцию, которая будет заполнять ордера, сохранять их и так далее

                    }
                }
            }




             else if (req.body.type === 'LIMIT') {

            }
        } else if (req.body.side === 'BUY') {
            if (req.body.type === 'MARKET') {
                // берём ордера из стакана продажи (покупаем у тех кто хочет продать)

            } else if (req.body.type === 'LIMIT') {

            }
        }





        const order = {
            amount: newOrderAmount,
            price: req.body.price,
            owner: req.user._id,
            type: req.body.type,
            side: req.body.side,
            product: req.body.product,
            status: 'NEW'
        };

        console.log('order', order);

        const response = await orderService.addOrder(order);

        console.log('response', response);

        res.json({ code: 200, data: response});
    });

    router.post('/get_orderbook', async (req, res) => {
        const orders = await orderService.getOrderbook(req.body.product);

        const sortedOrders = sortByPrice(orders);
        const orderBook = {
            sell: [],
            buy: []
        };

        const grouped = sortedOrders.reduce((grouped, item) => {
            const lastOrder = grouped[grouped.length - 1];

            if (lastOrder && lastOrder.price === item.price)
                lastOrder.amount = lastOrder.amount + item.amount;
            else grouped.push(item);

            return grouped;
        }, []);

        grouped.forEach((a) => {
            if (a.side === 'SELL') orderBook.sell.push(a);
            else if (a.side === 'BUY') orderBook.buy.push(a);
        });

        res.json({ code: 200, data: orderBook });
    });

    return router;
}
