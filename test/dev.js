import express from "express";
import initialise from "../build/main.js";
import path from "path";
import { fileURLToPath } from "url";
import monitor from 'express-status-monitor'

const dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.join(dirname, "../src", "templates");

const DEFAULT_CONFIG = {
  templatesDir: [templatesDir],
  ejsOptions: {
    root: "test",
    views: [templatesDir], // For relative paths
  },
};

let received = 0
let sent = 0

const init = async () => {
  console.log("Server starting");
  const pdfactoryHandler = await initialise(DEFAULT_CONFIG);

  const app = express();

  app.use(monitor());

  app.use(express.json());

  const requestHandler = async (req, res) => {
    let pdf = null;
    received = received + 1
    
    try {
      pdf = await pdfactoryHandler(req.body);
    } catch (e) {
      console.log(e)
      res.sendStatus(400);
    }
    
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdf.length,
    });
    sent = sent + 1
    res.send(pdf);
    
    console.table({received, sent, length: pdf.length}, )
    
  };

  app.post("/", requestHandler);

  app.listen(3000);

  return app;
};

await init();

console.log("Server started");
