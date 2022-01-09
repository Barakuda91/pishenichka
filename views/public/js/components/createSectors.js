Vue.component("create_sectors", {
    template: "#create_sectors",
    props: ['region_id', 'available_space'],
    data: function () {
        return {
            sectors: [{ size: 1 }],
            createdisabled: false,
            newsectordisabled: false
        }
    },
    beforeMount(){
        this.check();
    },
    methods: {
        check() {
            let size = 0;
            this.sectors.forEach((sector) => {
                size += Number(sector.size);
            });

            this.createdisabled = size > this.available_space;
            this.newsectordisabled = size <= this.available_space;
        },
        async create() {
            const data = await postData('/sectors/create', { id: this.region_id, sectors: this.sectors });
            if(data.code === 200) {
                this.$emit('get_regions');
                this.$emit('close');
            }
        }
    }
});
