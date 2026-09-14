// server.js

const http = require("http");

const PORT = 3000;

console.log("Starting HTTP server...");

const server = http.createServer((req, res) => {
    console.log(`Request received: ${req.method} ${req.url}`);

    // Set response header
    res.setHeader("Content-Type", "text/plain");

    if (req.url === "/") {
        res.statusCode = 200;
        res.end("Welcome to Smart Utility Toolkit!");
    }

    else if (req.url === "/about") {
        res.statusCode = 200;
        res.end("About Page - Node.js Core Modules Lab");
    }

    else if (req.url === "/contact") {
        res.statusCode = 200;
        res.end("Contact Page - Email: student@example.com");
    }

    else {
        res.statusCode = 404;
        res.end("404 Error - Page Not Found");
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});