import fs from "fs";
import http from "http";
import { spawnSync } from "child_process";
import { parseJson } from "./utils.mjs";

const METHODS = {
  POST: "POST",
  GET: "GET",
};

const PATHS = {
  DISCONNECT: "/disconnect",
  STATUS: "/status",
  PAGE: "/",
};

const psScriptPath = "C:\\temp\\test.ps1";
const htmlHomePage = fs.readFileSync("./src/index.html", "utf-8");

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (method === METHODS.POST && url.pathname === PATHS.DISCONNECT) {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const { userName } = JSON.parse(body);

        const result = spawnSync("powershell.exe", [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          psScriptPath,
          "-userName",
          userName,
        ]);

        if (result.error || result.status !== 0 || result.stderr.length > 0) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: "Error executing script",
              error:
                result.error?.message ||
                parseJson(result.stderr.toString()) ||
                "Unknown error",
            })
          );
          return;
        }
        console.info(`Script exited with code: ${result.status}`);
        console.info(`Script stderr: ${result.stderr.toString()}`);
        console.info(`Script output: ${result.stdout.toString()}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: `Usuário ${userName} desconectado.`,
            output: result.stdout.toString(),
          })
        );
      });
      return;
    }

    if (method === METHODS.GET && url.pathname === PATHS.PAGE) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(htmlHomePage);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Not Found" }));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal Server Error", error }));
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

// routes
// - POST /disconect
// - body: { userName: string }
// - response: { message: string }

// todo:
// - GET /status
// - response: { status: string }
