ঝামেলা ছাড়াই কপি–পেস্ট করার জন্য **Server README** নিচে দিলাম (আগেরটার স্টাইলেই)। এই রিপোটা **Movie Master Pro (Assignment 10, PH Batch–12)**-এর Express.js ব্যাকএন্ড।

---

````markdown
# Movie Master Pro — Server (Express.js)

![npm](https://img.shields.io/badge/npm-v1.0.1-CB3837?logo=npm&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-black?logo=express)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)
![CORS](https://img.shields.io/badge/CORS-enabled-blue)
![License: ISC](https://img.shields.io/badge/license-ISC-brightgreen)

> **Assignment 10 · PH Batch – 12**  
> Express + MongoDB server for the Movie Master Pro client app.

---

## ✨ Description (What this server does)
- 🧩 **REST API** movie ডেটার জন্য (CRUD: create, read, update, delete)
- 🗄️ **MongoDB** ডাটাবেস কানেকশন
- 🔐 **CORS** কনফিগ (client origin allow)
- 🔑 **Env-based config** (`.env` ব্যবহার)
- 🩺 **Healthcheck** endpoint

> নোট: নিচের রুটগুলো উদাহরণ হিসেবে দেওয়া—আপনার প্রকৃত রুট/কন্ট্রোলার নাম ভিন্ন হলে মিলিয়ে নিন।

---

## 📦 Packages (from `package.json`)
**Dependencies**
- `cors` ^2.8.5  
- `dotenv` ^17.2.3  
- `express` ^5.1.0  
- `mongodb` ^7.0.0  

**Dev / Scripts**
- বর্তমানে কেবল `test` স্ক্রিপ্ট আছে। রান করতে সরাসরি `node index.js` ব্যবহার করুন (নিচে দেখুন)।

---

## 📁 Directory Tree (example)
```text
ph12_efthi_movie_masterpro_A10_server/
├─ routes/
│  └─ movies.routes.js        # /api/movies রুটগুলি
├─ controllers/
│  └─ movies.controller.js    # হ্যান্ডলার/বিজনেস লজিক
├─ db/
│  └─ client.js               # MongoDB client/connection helper
├─ middlewares/               # (optional) auth, error handler
├─ utils/                     # (optional) helpers
├─ index.js                   # অ্যাপ এন্ট্রি
├─ .env                       # env variables (local)
├─ package.json
└─ README.md
````

> আপনার রিপোর কাঠামো ভিন্ন হলে এই সেকশনটি মিলিয়ে নিন।

---

## 🔧 Environment Variables

`.env` (লোকাল) উদাহরণ:

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
ORIGIN=http://localhost:5173   # client URL (Movie Master Pro)
NODE_ENV=development
```

---

## 🚀 Getting Started

```bash
# 1) Install
npm install

# 2) Run (no start script)
node index.js
# অথবা nodemon থাকলে:
# npx nodemon index.js
```

> চাইলে `package.json`-এ এগুলো যোগ করতে পারেন:

```json
"scripts": {
  "dev": "nodemon index.js",
  "start": "node index.js"
}
```

---

## 🧭 Example API Routes

> **Base URL:** `http://localhost:5000`

* **Healthcheck:** `GET /health` → `{ status: "ok" }`
* **Movies:**

  * `GET /api/movies` — সব মুভি
  * `GET /api/movies/:id` — একক মুভি
  * `POST /api/movies` — নতুন মুভি যোগ
  * `PATCH /api/movies/:id` — আপডেট
  * `DELETE /api/movies/:id` — ডিলিট

### Sample `curl`

```bash
# All movies
curl http://localhost:5000/api/movies

# Create
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","year":2010,"rating":8.8}'
```

---

## 🧱 Minimal index.js (reference)

> আপনার বর্তমান কোড থাকলে এটি দরকার নেই—শুধু কাঠামো বোঝানোর জন্য।

```js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors({ origin: process.env.ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (_, res) => res.json({ status: 'ok' }));

(async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();          // default DB from URI
  const Movies = db.collection('movies');

  app.get('/api/movies', async (_, res) => {
    res.json(await Movies.find().toArray());
  });

  app.get('/api/movies/:id', async (req, res) => {
    const doc = await Movies.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  });

  app.post('/api/movies', async (req, res) => {
    const result = await Movies.insertOne(req.body);
    res.status(201).json({ _id: result.insertedId, ...req.body });
  });

  app.patch('/api/movies/:id', async (req, res) => {
    await Movies.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    res.json({ updated: true });
  });

  app.delete('/api/movies/:id', async (req, res) => {
    await Movies.deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ deleted: true });
  });

  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
})();
```

---

## 🔗 Links

* **Server Repo:** [https://github.com/efthi/ph12_efthi_movie_masterpro_A10_server](https://github.com/efthi/ph12_efthi_movie_masterpro_A10_server)
* **Client Repo:** [https://github.com/efthi/ph12_efthi_movie_masterpro_A10_client](https://github.com/efthi/ph12_efthi_movie_masterpro_A10_client)

---

## 📜 License

ISC

```

আপনি চাইলে আমি এই README-টা ইংরেজি-অনলি বা বাংলা-অনলি স্টাইলে, আর আপনার প্রকৃত রুট/ফোল্ডার স্ট্রাকচার অনুযায়ী **ফাইন-টিউন** করে দিই—শুধু `index.js` (বা রুট ফাইলগুলো) একবার শেয়ার করুন।
::contentReference[oaicite:0]{index=0}
```
