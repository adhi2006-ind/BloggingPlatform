
# 🌿 MyBlog - Full-Stack Blogging Platform

MyBlog is a fully-featured MERN stack blogging platform with user authentication, post creation/editing, comment threads, profile management with Firebase avatars, password reset via email verification, and theme toggle with dynamic visuals.

---

## 📅 Development Timeline (Week 6–10)

### ✅ Week 6: Backend Core
- Set up Express server with MongoDB
- Defined models: `User`, `Post`, `Comment`
- Routes for authentication, post CRUD, and comments
- JWT token-based login/register system

### ✅ Week 7: Frontend & Routing
- React frontend with React Router
- Pages: Home, Register, Login, CreatePost, EditPost, PostDetails
- Added dynamic navigation, protected routes

### ✅ Week 8: Firebase Profile Integration
- Integrated Firebase Firestore and Storage
- Profile pictures using Firebase Storage
- Real-time profile updates via Firestore snapshots

### ✅ Week 9: Animations & UI
- Light green day theme + glowing night theme
- Particle animations: 🍃 leaves, shooting stars, ripple effects
- Responsive layout with TailwindCSS

### ✅ Week 10: Final Features
- Forgot password flow with email verification code
- Nodemailer with **Ethereal** for email testing
- Account deletion (with final confirmation)
- Refactoring for performance and theme consistency

---

## 🧠 Features

- 📝 Create, edit, delete blog posts
- 🔐 JWT Authentication (login/register)
- 🌌 Light/Dark theme toggle
- 📸 Profile with Firebase avatar upload
- 💬 Comments with threaded replies, likes, and deletion
- ✉️ Password reset via email verification code
- ❌ Account deletion
- 📱 Fully responsive, animated UI

---

## 💾 MongoDB Setup

### 🔹 Local (MongoDB Compass)
- Download MongoDB Community & Compass
- Connect to local DB using:  
  `mongodb://localhost:27017/myblog`

### 🔹 Cloud (MongoDB Atlas)
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a **free cluster**
- Whitelist your IP and connect with a string like:  
  `mongodb+srv://<username>:<password>@cluster0.mongodb.net/myblog?retryWrites=true&w=majority`

> 🔐 Make sure to set your connection string in `.env`:
```
MONGO_URI=your-mongodb-url
```

---

## ✉️ Email Verification with Ethereal

For password reset, we use `nodemailer` and **Ethereal**, a fake SMTP testing service.

- A random 6-digit code is sent via Nodemailer
- You can **view the verification code in the terminal** (VS Code output console)
- Ethereal also allows viewing emails via a preview link
- **No real emails** are sent — this is for **development only**

---

## 🚀 Running Locally

### 📦 Backend
```bash
cd backend
npm install
npm run dev
```

### 🌐 Frontend
```bash
cd client
npm install
npm run dev
```

### 📂 `.env` File (Backend)
```env
MONGO_URI=your-mongodb-url
JWT_SECRET=your_jwt_secret
ETHEREAL_EMAIL=auto-generated-email
ETHEREAL_PASS=auto-generated-password
```

---

## 🧰 Tech Stack

- **Frontend**: React + TailwindCSS  
- **Backend**: Express + Node.js  
- **Database**: MongoDB (Compass/Atlas)  
- **Authentication**: JWT  
- **Email**: Nodemailer + Ethereal  
- **Profile Management**: Firebase (Firestore + Storage)  
- **Styling & Animations**: TailwindCSS + Custom CSS  

---

## ✍️ Author

Made with ❤️ by **Adhithyan Antony**
