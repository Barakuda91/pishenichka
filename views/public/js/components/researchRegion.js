Vue.component("research_region", {
    template: "#research_region",
    props: ['region_id', 'user'],
    data: function () {
        return {
            studyType: '',
            agronomistId: ''
        }
    },
    beforeMount(){
    },
    methods: {
    }
});
