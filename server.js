const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// مسیر فایل‌های استاتیک
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        // دریافت IP واقعی کاربر
        const ip =
            req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress;

        // بررسی VPN / Proxy با ipwho.is
        const api = await fetch(`https://ipwho.is/${ip}`);
        const data = await api.json();

        const isVPN =
            data.success === false ||
            data.proxy === true ||
            data.hosting === true ||
            data.type === "hosting";

        if (isVPN) {
            // VPN فعال → صفحه بلاک
            return res.status(403).sendFile(path.join(__dirname, "blocked.html"));
        }

        // VPN خاموش → سایت اصلی
        res.sendFile(path.join(__dirname, "public/index.html"));

    } catch (err) {
        // خطا در API یا هر مشکل دیگر → بلاک
        res.status(403).sendFile(path.join(__dirname, "blocked.html"));
    }
});

// اجرا روی پورت Render / محلی
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
