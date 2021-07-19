new Vue({
    el: '#app',
    data: () => ({
        input: '',
        field: '',
    }),
    methods: {
        content(value) {
            return (this.field += value);
        },
        clearField() {
            return (this.field = '');
        },
        displayfield() {
            return this.field;
        },
    },
});
