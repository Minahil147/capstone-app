const {
    getActiveUserNames,
    getNumberStats
} = require("./utils/dataUtils");

const users = [
    { name: "Ali", active: true },
    { name: "Ahmed", active: false },
    { name: "Sara", active: true },
    { name: "Zain", active: true }
];

console.log(getActiveUserNames(users));

console.log(getActiveUserNames([]));

console.log(getActiveUserNames(null));

console.log(getNumberStats([2, 4, 6, 8]));

console.log(getNumberStats([]));

console.log(getNumberStats([100]));