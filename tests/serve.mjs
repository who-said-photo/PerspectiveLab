import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("dist");
http
  .createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1:4322");
    let target = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (!target.startsWith(root + path.sep) && target !== root) {
      response.writeHead(403).end();
      return;
    }
    if (url.pathname.endsWith("/")) target = path.join(target, "index.html");
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".svg": "image/svg+xml",
      }[path.extname(target)] || "text/plain",
    );
    fs.createReadStream(target).pipe(response);
  })
  .listen(4322, "127.0.0.1");
