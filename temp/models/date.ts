module.exports = {
    dateNow: function () {
        const date = new Date();
        return {
            fullDate: date,
            date: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        }
    },

    dateParse: function (d: Date) {
        const date = new Date(d);
        return {
            fullDate: date,
            date: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear()
        }
    }


}


