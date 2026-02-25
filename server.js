import express from "express";
import nodeHtmlToImage from "node-html-to-image";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

const TEMPLATE_PATH = path.join(__dirname, "template.html");
function loadTemplate() {
  return fs.readFileSync(TEMPLATE_PATH, "utf8");
}

function applyPatches(html, patches) {
  if (!patches || Object.keys(patches).length === 0) return html;
  const script = `<script>
  (function() {
    const patches = ${JSON.stringify(patches)};
    for (const [selector, props] of Object.entries(patches)) {
      document.querySelectorAll(selector).forEach(el => {
        for (const [prop, value] of Object.entries(props)) {
          if (prop === "text")               el.textContent = value;
          else if (prop === "html")          el.innerHTML = value;
          else if (prop === "src")           el.src = value;
          else if (prop === "href")          el.href = value;
          else if (prop.startsWith("style.")) el.style[prop.replace("style.", "")] = value;
          else if (prop === "class.add")     el.classList.add(...[].concat(value));
          else if (prop === "class.remove")  el.classList.remove(...[].concat(value));
          else if (prop.startsWith("attr.")) el.setAttribute(prop.replace("attr.", ""), value);
        }
      });
    }
  })();
  <\/script>`;
  return html.replace("</body>", script + "</body>");
}

async function render(html, selector) {
  const options = {
    html,
    puppeteerArgs: {
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    },
    waitUntil: "networkidle0",
  };
  if (selector) options.selector = selector;
  return await nodeHtmlToImage(options);
}

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.get("/template", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(loadTemplate());
});

app.get("/render/quick", async (req, res) => {
  try {
    const {
      id,
      nameAr,
      nameEn,
      age,
      gender,
      nationality,
      status,
      photo,
      seal,
      serverName,
    } = req.query;

    const patches = {};

    if (id) {
      patches[".id-val"] = { text: id };
      patches[".bc-txt"] = { html: `${id} · ARAB FIRST ROLEPLAY · CHARACTER FILE<br>2025 · AUTHORIZED ACCESS ONLY` };
    }
    if (nameAr)       patches[".char-name"]      = { text: nameAr };
    if (nameEn)       patches[".char-sub"]        = { text: nameEn };
    if (photo)        patches[".char-photo"]      = { src: photo };
    if (seal)         patches[".f-seal"]          = { text: seal };
    if (serverName)   patches[".orn-lbl"]         = { text: serverName };

    if (age)          patches[".info-cell:nth-child(1) .ic-val"] = { text: age };
    if (gender)       patches[".info-cell:nth-child(2) .ic-val"] = { text: gender };
    if (nationality)  patches[".info-cell:nth-child(3) .ic-val"] = { text: nationality };
    if (status)       patches[".info-cell:nth-child(4) .ic-val"] = { text: status };

    const img = await render(applyPatches(loadTemplate(), patches), "#char-card");
    res.setHeader("Content-Type", "image/png");
    res.send(img);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/render", async (req, res) => {
  try {
    const { patches = {}, selector = "#char-card" } = req.body;
    const img = await render(applyPatches(loadTemplate(), patches), selector);
    res.setHeader("Content-Type", "image/png");
    res.send(img);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/render-html", async (req, res) => {
  try {
    const { html, selector = null } = req.body;
    if (!html) return res.status(400).json({ error: "html is required" });
    const img = await render(html, selector);
    res.setHeader("Content-Type", "image/png");
    res.send(img);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public/index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢  Char-Card API running on port ${PORT}`));
