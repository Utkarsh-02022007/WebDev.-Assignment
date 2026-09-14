// dice.js

const crypto = require("crypto");

console.log("Smart Utility Toolkit - Dice Generator");
console.log("---------------------------------------");

function rollDice() {
    // Generate a secure random integer from 1 to 6
    return crypto.randomInt(1, 7);
}

const numberOfRolls = Number(process.argv[2]) || 1;

if (numberOfRolls <= 0 || !Number.isInteger(numberOfRolls)) {
    console.log("Error: Number of rolls must be a positive integer.");
    console.log("Example: node dice.js 5");
    process.exit(1);
}

console.log(`Rolling the dice ${numberOfRolls} time(s)...\n`);

for (let i = 1; i <= numberOfRolls; i++) {
    const result = rollDice();

    console.log(`Roll ${i}: Dice Rolled: ${result}`);
}

console.log("\nDice simulation completed.");