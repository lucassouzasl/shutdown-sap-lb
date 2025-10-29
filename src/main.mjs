import http from "http";
import { exec, spawnSync } from "child_process";

const METHODS = {
  POST: "POST",
  GET: "GET",
};

const PATHS = {
  DISCONNECT: "/disconnect",
  STATUS: "/status",
};

const psScriptPath = "C:\\temp\\test.ps1";

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = new URL(req.url, `http://${req.headers.host}`);

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

      if (result.error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Error executing script",
            error: result.error.message,
          })
        );
        return;
      }

      console.info(`Script output: ${result.stdout.toString()}`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `User ${userName} disconnected.` }));
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
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
