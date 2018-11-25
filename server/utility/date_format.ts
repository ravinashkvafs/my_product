import { cursorTo } from "readline";

module.exports = {
    now: () => {
        const currentDate = new Date(new Date().getTime() + (330 * 60 * 1000));
        const d = currentDate.toISOString();
        return {
            date: parseInt(d.split('T')[0].split('-')[2]),
            month: parseInt(d.split('T')[0].split('-')[1]),
            year: parseInt(d.split('T')[0].split('-')[0]),
            time: d.split('T')[1].split('.')[0],
            ms: currentDate.getTime(),
            full: d
        };
    },
    custom: (dt) => {
        const customDate = new Date(new Date(dt).getTime() + (330 * 60 * 1000));
        const d = customDate.toISOString();
        return {
            date: parseInt(d.split('T')[0].split('-')[2]),
            month: parseInt(d.split('T')[0].split('-')[1]),
            year: parseInt(d.split('T')[0].split('-')[0]),
            time: d.split('T')[1].split('.')[0],
            ms: customDate.getTime(),
            full: d
        };
    }
};