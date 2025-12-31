const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        const api = await fetch(`https://ipwho.is/${ip}`);
        const data = await api.json();

        const isVPN =
            data.success === false ||
            data.proxy === true ||
            data.hosting === true ||
            data.type === "hosting";

        if (isVPN) {
            return res.sendFile(path.join(__dirname, "blocked.html"));
        }

        res.sendFile(path.join(__dirname, "public/index.html"));

    } catch (err) {
        // هر خطایی = بلاک
        res.sendFile(path.join(__dirname, "blocked.html"));
    }
});

app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT);
});
