const getActiveUserNames = (users) => {
    if (!Array.isArray(users)) return [];

    return users
        .filter(user => user.active)
        .map(user => user.name)
        .sort();
};
const getNumberStats = (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        return {
            count: 0,
            sum: 0,
            average: 0,
            max: null
        };
    }
    const sum = numbers.reduce((total, num) => total + num, 0);
    return {
        count: numbers.length,
        sum,
        average: sum / numbers.length,
        max: Math.max(...numbers)
    };
};
module.exports = {
    getActiveUserNames,
    getNumberStats
};