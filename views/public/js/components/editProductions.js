Vue.component("edit_productions", {
    template: "#edit_productions",
    props: ['sector_id', 'production', 'user', '_'],
    data: function () {
        return {
            sector: {},
            createdisabled: false,
            enoughRawMaterials: {},
            newsectordisabled: false
        }
    },
    async beforeMount() {
        this.setColors();
        await this.getSector();
        // await this.getProductionList();
    },
    methods: {

        setColors() {
            for (const name in this.production.cycles) {
                for (const product in this.production.cycles[name].inputProducts) {
                    if (this.user.warehouse[product] < this.production.cycles[name].inputProducts[product])
                        this.enoughRawMaterials[name] = true;
                }
            }
        },

        async getSector() {
            console.log('this.sector_id', this.sector_id);
            const res = await postData('/sectors/get_sector', { id: this.sector_id });

            // notEnoughRawMaterials
            if (res.data.type !== 'BUILD') {
                app.startInfoModal('Сектор не предназначен для постройки');
                this.$emit('close');
            }
        },

        async startCycle(recipeId, productionId) {
            const response = await postData('/production/start_cycle', {
                sectorId: this.sector_id,
                productionId,
                recipeId
            });

            console.log('data production', response);
            if(response.status === 'OK') {
                this.production.cycles = response.data.cycles;
                this.setColors();
            }
        },

        async stopCycle(recipeId, productionId) {
            const response = await postData('/production/stop_cycle', {
                sectorId: this.sector_id,
                productionId,
                recipeId
            });

            console.log('data production', response);
            if(response.status === 'OK') {
                this.production.cycles = response.data.cycles;
                this.setColors();
            }
        }
    }
});
