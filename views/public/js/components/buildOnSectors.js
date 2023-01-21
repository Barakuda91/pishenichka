Vue.component("build_on_sectors", {
    template: "#build_on_sectors",
    props: ['sector', 'available_space', 'user', '_'],
    data: function () {
        return {
            productionList: {},
            createdisabled: false,
            newsectordisabled: false
        }
    },
    async beforeMount(){
        await this.getProductionList();
    },
    methods: {
        async getProductionList() {
            const res = await postData('/sectors/get_production_list');
            console.log('data', res);
            this.productionList = res.data;
        },
        async build(productionName) {
            const data = await postData('/production/build', {
                sectorId: this.sector._id,
                productionName
            });

            if(data.status === 'OK') {
                this.$emit('get_regions');
            }
            this.$emit('close');
        }
    }
});
