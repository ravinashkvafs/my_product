import { cursorTo } from "readline";

module.exports = {
    now: () => {
        const dt = new Date();
        const currentDate = new Date(dt.getTime() + (330 * 60 * 1000));
        const d = currentDate.toISOString();
        return {
            date: parseInt(d.split('T')[0].split('-')[2]),
            month: parseInt(d.split('T')[0].split('-')[1]),
            year: parseInt(d.split('T')[0].split('-')[0]),
            time: d.split('T')[1].split('.')[0],
            ms: dt.getTime(),
            full: d
        };
    },
    custom: (myDate) => {
        const dt = new Date(myDate);
        const currentDate = new Date(dt.getTime() + (330 * 60 * 1000));
        const d = currentDate.toISOString();
        return {
            date: parseInt(d.split('T')[0].split('-')[2]),
            month: parseInt(d.split('T')[0].split('-')[1]),
            year: parseInt(d.split('T')[0].split('-')[0]),
            time: d.split('T')[1].split('.')[0],
            ms: dt.getTime(),
            full: d
        };
    }
};