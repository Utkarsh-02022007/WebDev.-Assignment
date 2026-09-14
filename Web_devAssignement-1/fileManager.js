// fileManager.js

const fs = require("fs");

const fileName = "sample.txt";

console.log("Smart Utility Toolkit - File Manager");
console.log("--------------------------------------");

// CREATE FILE
console.log("\n1. Creating file...");

fs.writeFile(fileName, "Hello from Node.js File Manager!\n", (err) => {
    if (err) {
        console.log("Error creating file:", err.message);
        return;
    }

    console.log("File created successfully.");

    // READ FILE
    console.log("\n2. Reading file...");

    fs.readFile(fileName, "utf8", (err, data) => {
        if (err) {
            console.log("Error reading file:", err.message);
            return;
        }

        console.log("File content:");
        console.log(data);

        // UPDATE FILE
        console.log("3. Updating file...");

        fs.appendFile(
            fileName,
            "This line was added during the update operation.\n",
            (err) => {
                if (err) {
                    console.log("Error updating file:", err.message);
                    return;
                }

                console.log("File updated successfully.");

                // READ UPDATED FILE
                fs.readFile(fileName, "utf8", (err, updatedData) => {
                    if (err) {
                        console.log(
                            "Error reading updated file:",
                            err.message
                        );
                        return;
                    }

                    console.log("\nUpdated file content:");
                    console.log(updatedData);

                    // DELETE FILE
                    console.log("4. Deleting file...");

                    fs.unlink(fileName, (err) => {
                        if (err) {
                            console.log(
                                "Error deleting file:",
                                err.message
                            );
                            return;
                        }

                        console.log("File deleted successfully.");
                        console.log("\nAll file operations completed.");
                    });
                });
            }
        );
    });
});
