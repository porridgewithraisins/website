module.exports = {
    db: "db.sqlite",
    port: process.env.NODE_ENV === "production" ? 443 : 9999,
    keyPath: "key.pem",
    certPath: "cert.pem",
};
