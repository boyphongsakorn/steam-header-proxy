const https = require("https");

const CORS_PROXY =
  "https://cors-fany.vercel.app/store.steampowered.com/api/appdetails";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Invalid JSON from Steam API"));
          }
        });
      })
      .on("error", reject);
  });
}

function fetchBinary(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchBinary(res.headers.location).then(resolve).catch(reject);
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            buffer: Buffer.concat(chunks),
            contentType: res.headers["content-type"] || "image/jpeg",
          })
        );
      })
      .on("error", reject);
  });
}

export default async function handler(req, res) {
  const { appid } = req.query;

  if (!appid || !/^\d+$/.test(appid)) {
    return res
      .status(400)
      .json({ error: "Missing or invalid ?appid= parameter" });
  }

  try {
    const json = await fetchJson(`${CORS_PROXY}?appids=${appid}&cc=th`);

    const appData = json[appid];

    let headerImage;
    if (!appData?.success) {
      // Config/non-store apps: fallback to placeholder with appid
      headerImage = `https://placehold.co/460x215?text=App+${appid}`;
    } else {
      headerImage = appData.data?.header_image;
      if (!headerImage) {
        const appName = encodeURIComponent(appData.data?.name || appid);
        headerImage = `https://placehold.co/460x215?text=${appName}`;
      }
    }

    const { buffer, contentType } = await fetchBinary(headerImage);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}