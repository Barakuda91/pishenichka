Vue.component("field", {
    template: "#field",
    props: ['sector', 'id', 'user', '_'],
    data: function () {
        return {
            sow_sector_type: [],
            sow_sector_quantity: [],
            sell_harvest_quantity: [],
        }
    },
    beforeMount(){

    },
    methods: {

        sow_sector: async function (id, seedType, quantity) {
            const data = await postData('/field/sow', { id, seedType, quantity });

            if (data.error) this.startErrorModal(data.error);
        },

        harvest_sector: async function (id) {
            const data = await postData('/field/harvest', { id });

            if (data.error) this.startErrorModal(data.error);
        },

        clear_sector: async function (id) {
            const data = await postData('/field/clear', { id });

            if (data.error) this.startErrorModal(data.error);
        },
    }
});
