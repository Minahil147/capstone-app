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
            Count: 0,
            Sum: 0,
            Average: 0,
            Max: null
        };
    }
    const sum = numbers.reduce((total, num) => total + num, 0);
    return {
        Count: numbers.length,
        Sum: sum,
        Average: sum / numbers.length,
        Max: Math.max(...numbers)
    };
};
module.exports = {
    getActiveUserNames,
    getNumberStats
};