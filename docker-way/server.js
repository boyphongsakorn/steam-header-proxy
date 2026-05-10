const http = require("http");
const https = require("https");

const PORT = process.env.PORT || 3000;
const CORS_PROXY = "https://cors-fany.vercel.app/store.steampowered.com/api/appdetails";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Invalid JSON")); }
      });
    }).on("error", reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchBinary(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: res.headers["content-type"] || "image/jpeg" }));
    }).on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok" }));
  }

  // GET /header?appid=2807960
  if (url.pathname === "/header") {
    const appid = url.searchParams.get("appid");
    if (!appid || !/^\d+$/.test(appid)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Missing or invalid ?appid= parameter" }));
    }

    try {
      const apiUrl = `${CORS_PROXY}?appids=${appid}&cc=th`;
      const json = await fetchJson(apiUrl);

      const appData = json[appid];
      if (!appData?.success) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "App not found or API returned success=false" }));
      }

      const headerImage = appData.data?.header_image;
      if (!headerImage) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "No header_image in response" }));
      }

      // Fetch and proxy the image
      const { buffer, contentType } = await fetchBinary(headerImage);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": buffer.length,
        "Cache-Control": "public, max-age=3600",
      });
      return res.end(buffer);

    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found", usage: "GET /header?appid=<steam_appid>" }));
});

server.listen(PORT, () => {
  console.log(`Steam header image server running on port ${PORT}`);
  console.log(`Usage: GET http://localhost:${PORT}/header?appid=2807960`);
});
