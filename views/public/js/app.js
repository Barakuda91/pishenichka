Vue.component("v-select", VueSelect.VueSelect);
const app = new Vue({
    el: '#app',
    data: {
        regions: {},
        regionsTabs: {},
        additional_tab: 'regions',
        additional_shop_tab: 'fields',
        additional_regions_tab: 'sectors',
        additional_warehouse_tab: 'harvest',
        sell_harvest_quantity: [],
        product_amounts: {},
        errorTitle: 'ОШИБКА',
        errorText: null,
        infoModalText: null,
        timeString: '',
        temp: null,
        balance: 0,
        priceFactor: 0,
        fieldsBuildingFactor: 0,
        entities: {},
        user: { warehouse: { } },
        sectorFactors: {},
        actualPrices: {},
        plant: {},
        editProductions: { show: false, sectorId: null, production: null },
        buildOnSectors: { show: false, sectorId: null },
        createSectors: { show: false, regionId: null, availableSpace: 0 },
        researchRegion: { show: false, regionId: null},
        lang: {}
    },
    async beforeMount(){
        this.sectorFactors = (await postData('/get_field_factors')).data;
        await this.update();
        await this.getRegions();
        this.update_regions_values();
        this.update_warehouse_values();
        this.getLang();

        setInterval(async () => {
            await this.update();
        }, 1000);
    },
    methods: {
        _: function(key) {
            return this.lang[key.toUpperCase()] ? this.lang[key.toUpperCase()] : key.toUpperCase();
        },
        $: function(price) {
            if (!price)
                return 0;
            return (price * this.priceFactor).toFixed(0);
        },
        deleteSector: async function(id) {

            const res = await postData('/sectors/delete', { id });
            if (res && res.code === 200)
                await this.getRegions();
        },

        editProduction: async function (id, production) {
            this.editProductions.sectorId = id;
            this.editProductions.production = production;
            this.editProductions.show = true;
        },

        buildOnSector: async function (id) {
            this.buildOnSectors.sectorId = id;
            this.buildOnSectors.show = true;
        },

        createSector(id, availableSpace) {
            this.createSectors.regionId = id;
            this.createSectors.availableSpace = availableSpace;
            this.createSectors.show = true;
        },
        update: async function () {
            const data = await postData('/get_update');
            if (data.error) this.startErrorModal(data.error);
            this.timeString = data.isoString;
            this.temp = data.temp;
            this.balance = data.user.balance;
            this.entities = data.entities;
            this.user = data.user;
            this.priceFactor = data.priceFactor;
            this.actualPrices = data.actualPrices;

            this.user.agronomists = [
                {
                    name: 'Gustaf',
                    surname: 'Malkov',
                    lvl: 13,
                    exp: 3267
                },
                {
                    name: 'Ernest',
                    surname: 'Abramov',
                    lvl: 3,
                    exp: 559
                },
            ];

            this.user.agronomists.forEach((agr) => {agr.fullName = `${agr.name} ${agr.surname}`;})
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
        getLang: async function () {
            this.lang = (await postData('/get_lang', { lang: 'ru' })).data;
        },
        update_warehouse_values: function () {


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

        unrent_sector: async function (id) {
            const data = await postData('/field/unrent', { id });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        sell_harvest: async function (productName, quantity) {
            const data = await postData('/product/sell', { productName, quantity });
            console.log('data', data);
            if (data.error) this.startErrorModal(data.error);
        },

        buy_product: async function (productName, quantity) {

            if (!quantity) return;

            const data = await postData('/product/buy', { productName, quantity });

            console.log('data', data);

            if (data.error) this.startErrorModal(data.error);
        }
    }
});
