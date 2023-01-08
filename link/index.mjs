import { createSecureServer } from "node:http2";
import Express from "express";
import Database from "better-sqlite3";
import PatchHttp2 from "http2-express-bridge";

if (!process.env.ADMIN_KEY) throw new Error("No admin key provided");
if (!process.env.TLS_KEY) throw new Error("No TLS key provided");
if (!process.env.TLS_CERT) throw new Error("No TLS cert provided");
if (!process.env.PORT) throw new Error("No port provided");

const App = Main();

const Server = createSecureServer(
    {
        key: process.env.TLS_KEY,
        cert: process.env.TLS_CERT,
    },
    App
).listen(process.env.PORT);

console.log(`Listening at ${Server.address()}`);

function Main() {
    const Db = new Database("db.sqlite", { verbose: console.log });
    Db.exec(`
    CREATE TABLE
    IF NOT EXISTS links (
        name TEXT PRIMARY KEY NOT NULL,
        url TEXT NOT NULL
    );`);

    const selectStmt = Db.prepare("SELECT url FROM links WHERE name = ?");
    const insertStmt = Db.prepare("INSERT INTO links (name, url) VALUES (?, ?)");

    const App = PatchHttp2(Express);

    App.use(Express.urlencoded({ extended: true }));

    App.get("/link", (req, res) => {
        const { to: name } = req.query;
        if (!name) return res.status(400).send("Please provide something to proxy to");

        const entry = selectStmt.get(name);

        if (!entry) return res.status(404).send("Not found");

        res.redirect(entry.url);
    });

    App.post("/", (req, res) => {
        const { key, name, url } = req.body;

        if (key !== process.env.ADMIN_KEY) return res.status(401).send("Unauthorized");

        if (!name || !url) return res.status(400).send("Please provide a name and url");

        insertStmt.run(name, url);

        res.status(201).send(`Created link to ${url} with name ${name}`);
    });

    return App;
}
