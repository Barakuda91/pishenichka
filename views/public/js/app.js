
const app = new Vue({
    el: '#app',
    data: {
        regions: {},
        regionsTabs: {},
        additional_tab: 'regions',
        additional_shop_tab: 'fields',
        additional_regions_tab: 'regions',
        additional_warehouse_tab: 'harvest',
        seeds_shop: {},
        sow_sector_type: [],
        sow_sector_quantity: [],
        sell_harvest_quantity: [],
        errorTitle: 'ОШИБКА',
        errorText: null,
        infoModalText: null,
        day: null,
        year: null,
        temp: null,
        balance: 0,
        priceFactor: 0,
        fieldsBuildingFactor: 0,
        entities: {},
        user: { warehouse: { seeds: {}, harvest: {}} },
        sectorFactors: {},
        actualPrices: {},
        plant: {},
        createSectors: { show: false, regionId: null, availableSpace: 0 }
    },
    async beforeMount(){
        this.sectorFactors = (await postData('/get_field_factors')).data;
        await this.update();
        await this.getRegions();
        this.update_regions_values();
        this.update_warehouse_values();

        setInterval(async () => {
            await this.update();
        }, 1000);
    },
    methods: {
        _: function(text) {
            const lang = {
                FIELD: 'поле',
                VINEYARD: 'виноградник',
                GARDEN: 'сад',
                WAREHOUSE: 'склад',
                ELEVATOR: 'эдеватор',
                GARAGE: 'гараж',
                WINERY: 'винный завод',
                BREWERY: 'пивоварня',
                DISTILLERY: 'вискикурня',
                BAKERY: 'хлебзавод',
                wheat: 'пишеничка',
                barley: 'ячмень',
                corn: 'кукуруза'
            };
            return lang[text];
        },
        $: function(price) {
            return (price * this.priceFactor).toFixed(0);
        },

        deleteSector: async function(id) {

            const res = await postData('/sectors/delete', { id });
            console.log(res);
            if (res && res.code === 200)
                await this.getRegions();
        },

        createSector(id, availableSpace) {
            this.createSectors.regionId = id;
            this.createSectors.availableSpace = availableSpace;
            this.createSectors.show = true;
        },
        update: async function () {
            const data = await postData('/get_update');
            // console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
            this.day = data.currentDay;
            this.year = data.currentYear;
            this.temp = data.temp;
            this.balance = data.user.balance;
            this.entities = data.entities;
            this.user = data.user;
            this.priceFactor = data.priceFactor;
            this.actualPrices = data.actualPrices;
        },
        toggleSectorsInRegion: async function(id) {
            this.regions.forEach((region, i) => {
                if (region._id === id) {
                    Vue.set(this.regions[i], 'openTab', !region.openTab);
                    this.regionsTabs[region._id] = this.regions[i].openTab;
                    app.$forceUpdate();
                }
            });
        },
        getRegions: async function() {
            this.regions = (await postData('/regions/get_my')).data;
            this.regions.forEach((region) => {
                region.openTab = this.regionsTabs[region._id];
            });
        },
        update_warehouse_values: function () {

            // if (this.user.warehouse) {
            //     for(const harvestType in this.user.warehouse.harvest) {
            //         this.sell_harvest_quantity[harvestType] = this.user.warehouse.harvest[harvestType]
            //             ? this.user.warehouse.harvest[harvestType].toFixed(0)
            //             : 0;
            //     }
            // }

        },
        update_regions_values: function () {

            // if (this.user.warehouse) {
            //     this.entities.fields.forEach((field, id) => {
            //         if (field.ownerId === this.user._id) {
            //             this.sow_field_quantity[id] = this.user.warehouse.seeds['wheat']
            //                 ? this.user.warehouse.seeds['wheat'] > field.size ? field.size : this.user.warehouse.seeds['wheat'].toFixed(0)
            //                 : 0;
            //             this.sow_field_type[id] = 'wheat';
            //         }
            //     });
            // }
        },
        startInfoModal: function (text) {
            this.infoModalText = text;
            setTimeout(() => { this.infoModalText = null; },3000)
        },
        startErrorModal: function (text) {
            this.errorText = text;
            setTimeout(() => { this.errorText = null; },3000)
        },
        rent_sector: async function (id) {

            const data = await postData('/field/rent', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        buy_sector: async function (id) {

            const data = await postData('/field/buy', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        sell_sector: async function (id) {
            const data = await postData('/field/sell', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        sow_sector: async function (id, seedType, quantity) {
            const data = await postData('/field/sow', { id, seedType, quantity });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        harvest_sector: async function (id) {
            const data = await postData('/field/harvest', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        unrent_sector: async function (id) {
            const data = await postData('/field/unrent', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        clear_sector: async function (id) {
            const data = await postData('/field/clear', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        sell_harvest: async function (harvestType, quantity) {
            const data = await postData('/harvest/sell', { harvestType, quantity });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        buy_seeds: async function (seedType, quantity) {

            if (!quantity) return;
            const data = await postData('/seeds/buy', { seedType, quantity });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        update4: function () {
            this.message = `Updated at ${Date.now()}`
        },
    }
});
