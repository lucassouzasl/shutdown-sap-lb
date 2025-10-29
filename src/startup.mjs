import nodeWindows from "node-windows";

const script = process.argv[1];

if (!script) throw new Error(`No script specified to run as a service.`);

const svc = new nodeWindows.Service({
  name: "Shutdown Sap",
  description: "Shutdown user session and SAP application",
  script,
});

svc.on("install", () => {
  svc.start();
});

svc.install();
