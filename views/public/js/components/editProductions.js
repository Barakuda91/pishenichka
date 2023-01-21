Vue.component("edit_productions", {
    template: "#edit_productions",
    props: ['sector', 'production', 'user', '_'],
    data: function () {
        return {
            createdisabled: false,
            enoughRawMaterials: {},
            newsectordisabled: false,
            isUnderConstruction: null,
            constructionProgress: null
        }
    },
    async beforeMount() {

        setInterval(() => {
            if(this.sector.production.endOfConstruction > Date.now()) {
                this.isUnderConstruction = true;
                const proideno = Date.now() - this.sector.production.createdTime;
                const total = this.sector.production.endOfConstruction - this.sector.production.createdTime;
                this.constructionProgress = Number(((100 * proideno ) / total).toFixed(0));
            } else
                this.isUnderConstruction = false;

            if (this.production.cycles) {
                for (const cycleName in this.production.cycles) {
                    const cycle = this.production.cycles[cycleName];
                    const proideno = Date.now() - cycle.startCycle;
                    cycle.progress = (100 * proideno) / cycle.cycleDurationInMs;
                    if (cycle.progress > 100) {
                        cycle.startCycle += cycle.cycleDurationInMs;
                    }
                }
            }
        }, 400);

        this.setColors();
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

        async startCycle(recipeId, productionId) {
            const response = await postData('/production/start_cycle', {
                sectorId: this.sector._id,
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
                sectorId: this.sector._id,
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