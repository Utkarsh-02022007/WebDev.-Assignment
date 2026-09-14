// calculator.js

console.log("Smart Utility Toolkit - Calculator");
console.log("-----------------------------------");

// Get command-line arguments
const operation = process.argv[2];
const num1 = Number(process.argv[3]);
const num2 = Number(process.argv[4]);

// Check whether numbers are valid
if (isNaN(num1) || isNaN(num2)) {
    console.log("Error: Please enter two valid numbers.");
    console.log("Example: node calculator.js add 10 5");
    process.exit(1);
}

let result;

switch (operation) {
    case "add":
        result = num1 + num2;
        break;

    case "subtract":
        result = num1 - num2;
        break;

    case "multiply":
        result = num1 * num2;
        break;

    case "divide":
        if (num2 === 0) {
            console.log("Error: Division by zero is not allowed.");
            process.exit(1);
        }

        result = num1 / num2;
        break;

    default:
        console.log("Error: Invalid operation.");
        console.log("Available operations: add, subtract, multiply, divide");
        console.log("Example: node calculator.js add 10 5");
        process.exit(1);
}

console.log(`Operation: ${operation}`);
console.log(`Numbers: ${num1}, ${num2}`);
console.log(`Result: ${result}`);