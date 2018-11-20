module.exports = {
    now: () => {
        const d = new Date(new Date().getTime() + (330 * 60 * 1000)).toISOString();
        return {
            date: parseInt(d.split('T')[0].split('-')[2]),
            month: parseInt(d.split('T')[0].split('-')[1]),
            year: parseInt(d.split('T')[0].split('-')[0]),
            time: d.split('T')[1].split('.')[0],
            full: d
        };
    }
};