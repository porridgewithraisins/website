const fs = require("fs");
const https = require("https");
const express = require("express");
const Database = require("better-sqlite3");
const Config = require("./config.js");

if (!process.env.ADMIN_KEY) throw new Error("No admin key provided");
if (!Config.db) throw new Error("No database path provided");
if (!Config.port) throw new Error("No port provided");
if (!Config.keyPath) throw new Error("No key path provided");
if (!Config.certPath) throw new Error("No cert path provided");

const db = new Database(Config.db, { verbose: console.log });
db.exec(fs.readFileSync("migration.sql", "utf-8"));

const selectStmt = db.prepare("SELECT url FROM links WHERE name = ?");
const insertStmt = db.prepare("INSERT INTO links (name, url) VALUES (?, ?)");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/link", (req, res) => {
    const { to: name } = req.query;
    if (!name) return res.status(400).send("Please provide something to proxy to");

    const entry = selectStmt.get(name);

    if (!entry) return res.status(404).send("Not found");

    res.redirect(entry.url);
});

app.post("/", (req, res) => {
    const { key, name, url } = req.body;

    if (key !== process.env.ADMIN_KEY) return res.status(401).send("Unauthorized");

    if (!name || !url) return res.status(400).send("Please provide a name and url");

    insertStmt.run(name, url);

    res.status(201).send(`Created link to ${url} with name ${name}`);
});

const listener =
    process.env.NODE_ENV !== "production"
        ? app
        : https.createServer(
              {
                  key: fs.readFileSync(Config.keyPath),
                  cert: fs.readFileSync(Config.certPath),
              },
              app
          );

listener.listen(Config.port, () => {
    console.log(`Listening on port ${Config.port}`);
});
