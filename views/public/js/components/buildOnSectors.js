Vue.component("build_on_sectors", {
    template: "#build_on_sectors",
    props: ['sector_id', 'available_space', 'balance', '_'],
    data: function () {
        return {
            sector: {},
            productionList: {},
            createdisabled: false,
            newsectordisabled: false
        }
    },
    async beforeMount(){
        await this.getSector();
        await this.getProductionList();
    },
    methods: {
        async getProductionList() {
            const res = await postData('/sectors/get_production_list');
            console.log('data', res);
            this.productionList = res.data;
            // res.data.forEach((el) => {
            //     this.productionList[el.type] = el;
            // })
            console.log(this.productionList);
        },
        async getSector() {
            console.log('this.sector_id', this.sector_id);
            const res = await postData('/sectors/get_sector', { id: this.sector_id });
            console.log('data', res);

            if (res.data.type !== 'BUILD') {
                app.startInfoModal('Сектор не предназначен для постройки');
                this.$emit('close');
            }
        },
        async build(productionName) {
            const data = await postData('/production/build', {
                sectorId: this.sector_id,
                productionName
            });
console.log('data', data);
            // if(data.code === 200) {
            //     this.$emit('get_regions');
            //     this.$emit('close');
            // }
        }
    }
});
