Vue.component("edit_cultivations", {
    template: "#edit_cultivations",
    props: ['sector', 'production', 'user', '_'],
    data: function () {
        return {
            createdisabled: false,
            progress: 59,
            enoughRawMaterials: {},
            newsectordisabled: false
        }
    },
    async beforeMount() {

        const stRelOn = () => {
            if (this.production.cycles) {
                for (const cycleName in this.production.cycles) {
                    const cycle = this.production.cycles[cycleName];
                    const proideno = Date.now() - cycle.startCycle;
                    cycle.progress = Number(((100 * proideno) / cycle.cycleDurationInMs).toFixed(2));
                    if (cycle.progress > 100) {
                        cycle.startCycle += cycle.cycleDurationInMs;
                    }
                }
            }
        }
        stRelOn();
        setInterval(stRelOn, 900)
    },
    methods: {

        async startCycle(recipeId, productionId) {
            const response = await postData('/production/start_cycle', {
                sectorId: this.sector._id,
                productionId,
                recipeId
            });

            console.log('data production', response);
            if(response.status === 'OK') {
                this.production.cycles = response.data.cycles;
                //this.setColors();
            }
        },

        async stopCycle(recipeId, productionId) {
            const response = await postData('/production/stop_cycle', {
                sectorId: this.sector._id,
                productionId,
                recipeId
            });

            console.log('data production', response);
            if(response.status === 'OK') {
                this.production.cycles = response.data.cycles;
                //this.setColors();
            }
        }
    }
});
