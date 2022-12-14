const { SHA256, MD5 } = require("crypto-js");
const jwt = require("jsonwebtoken");

module.exports = ({ users, config }) => {
    return {
        makePass: password => SHA256(MD5(password)).toString(),
        getUserToken: user => jwt.sign({
                _id: user._id,
                login: user.login,
            }, user.pass),
        createUser: async data => users.create(data),
        getUserByLogin: async login => users.findOne({ login }),
        findUserByLogin: async login => users.findOne({ login }).lean().exec(),
        getUser: async _id => users.findOne({ _id }),
        findUser: async _id => users.findOne({ _id }).lean().exec(),
        updateUser: async (_id, data) => users.updateOne({ _id }, data ),
    }
}
