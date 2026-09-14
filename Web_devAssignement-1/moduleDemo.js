const isEven = require("./isEven");

console.log("Custom Module Demonstration");
console.log("---------------------------");

const numbers = [2, 5, 10, 13, 20];

numbers.forEach((number) => {
    if (isEven(number)) {
        console.log(`${number} is even.`);
    } else {
        console.log(`${number} is odd.`);
    }
});