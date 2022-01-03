const fs = require('fs-extra');
const path = require('path');
const mongoose = require("mongoose");
const config = require('../config/global');

module.exports = class DB {
    #models = {};

    async init() {
        const modelsPath = path.join(__dirname, '../', config.db.models_path);
        const models = await fs.readdir(modelsPath);
        await mongoose.connect(config.db.connect_path, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        models.forEach((file) => {
            const filePath = path.join(__dirname, '../', config.db.models_path, file);
            const parsedPath = path.parse(filePath);
            const name = parsedPath.name;

            this.#models[name] = mongoose.model(name, require(filePath));
            this[name] = this.#models[name];

            console.log(`Schema init: ${name}`);
        });
    }
};
