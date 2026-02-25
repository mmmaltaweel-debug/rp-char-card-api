# 🪪 RP Char Card API

API يحوّل بطاقة هوية شخصية RP من HTML إلى صورة PNG — مبني بـ Node.js + Express + Puppeteer.

## 🚀 تشغيل محلي

```bash
npm install
npm start
```

## 📡 نقاط الـ API

### `GET /health`
فحص الحالة.

### `GET /template`
عرض الـ HTML template كاملاً في المتصفح.

### `GET /render/quick`
رندر سريع عبر query params:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `id` | رقم هوية الشخصية | `AF-0001` |
| `nameAr` | الاسم بالعربي | `محمد العتيبي` |
| `nameEn` | الاسم بالإنجليزي | `MOHAMMED AL-OTAIBI` |
| `age` | العمر | `28 سنة` |
| `gender` | الجنس | `ذكر` |
| `nationality` | الجنسية | `سعودي` |
| `status` | الحالة | `نشط` |
| `photo` | رابط صورة الشخصية | `https://...` |
| `seal` | نص الختم في الفوتر | `VERIFIED` |
| `serverName` | اسم السيرفر | `ARAB FIRST RP` |

**مثال:**
```
GET /render/quick?id=AF-0001&nameAr=محمد&nameEn=MOHAMMED&age=28&gender=ذكر&nationality=سعودي&status=نشط
```

### `POST /render`
رندر مع patches مخصصة (CSS selectors):

```json
{
  "patches": {
    ".char-name": { "text": "فهد القحطاني" },
    ".char-sub": { "text": "FAHAD AL-QAHTANI" },
    ".id-val": { "text": "AF-0099" }
  },
  "selector": "#char-card"
}
```

### `POST /render-html`
رندر HTML خام:

```json
{
  "html": "<html>...</html>",
  "selector": "#char-card"
}
```

## 📁 هيكل المشروع

```
rp-char-card-api/
├── server.js        ← نقطة الدخول الرئيسية
├── template.html    ← قالب بطاقة الشخصية
├── keep-alive.js    ← منع النوم على Render/Railway
├── package.json
├── public/
│   └── index.html   ← صفحة توثيق الـ API
└── README.md
```

## ⚙️ متغيرات البيئة

| Variable | Description |
|----------|-------------|
| `PORT` | منفذ السيرفر (افتراضي: `3000`) |
| `SELF_URL` | رابط التطبيق للـ keep-alive |
