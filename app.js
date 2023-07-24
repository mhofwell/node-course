const http = require("http");
const fs = require("fs");

function requestHandler(req, res) {
    const url = req.url;
    const method = req.method;
    if (url === "/") {
        res.setHeader("Content-Type", "text/html");
        res.write("<html>");
        res.write("<head><title>My First Page</title></head>");
        res.write(
            "<body><h1><form action='/message' method='POST'><input type='text' name='message'><button type='submit'>Send</button></form></h1><body>"
        );
        res.write("</html>");
        return res.end();
    }
    if (url === "/message" && method === "POST") {
        const body = [];
        req.on("data", (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        return req.on("end", () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split("=")[1];
            console.log(parsedBody);
            fs.writeFile("message.txt", message, (error) => {
                res.statusCode = 302;
                res.setHeader("Location", "/");
                return res.end();
            });
        });
    }
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>My First Page</title></head>");
    res.write("<h1>My First Page</h1>");
    res.write("</html>");
    res.end();
}

const server = http.createServer(requestHandler);

server.listen(3000);
