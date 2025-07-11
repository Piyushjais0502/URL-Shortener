# 🔗 URL Shortener API

A simple and lightweight URL Shortener built with **Node.js**, **Express**, and **Vite**.  
Supports short link creation with custom codes and optional expiration.  
Logs every action via a custom logging service.

---

## 🚀 Features

- Shorten any valid URL
- Auto-fixes URLs missing `http://` or `https://`
- Custom shortcode support
- Set expiration time in minutes
- Redirects with logging
- Safe, secure, and fast

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express, NanoID, Nodemon
- **Frontend**: Vite, Vanilla JS (or React if added)
- **Logger**: External API (mocked when offline)

---

## 📦 Installation

```bash
git clone https://github.com/Piyushjais0502/url-shortener.git
cd url-shortener

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install


├── backend
│   ├── index.js
│   ├── middleware
│   │   └── logger.js
│   └── utils
│       └── auth.js
├── frontend
│   ├── index.html
│   ├── main.js / App.jsx
├── README.md


Piyush Kumar Jaiswal
B.Tech CSE | Galgotias University
📧 piyushkumarj48@gmail.com
