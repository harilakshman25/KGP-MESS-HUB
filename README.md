# 🍽️ KGP MessHub

A full-featured mess management web application built for the hostel messes at IIT Kharagpur. Designed to streamline student transactions, inventory, and order tracking with a secure multi-role access system.

---

## 🚀 Features

- 🔐 **Multi-Role Authentication**: Admin approval for Mess Managers before login.
- 🧾 **Student Management**: Upload CSVs, manage profiles, and track balances.
- 🛒 **Order System**: Real-time cart, batch checkout, and order history tracking.
- 🗝️ **Secure Access Control**: Secret keys, manager overrides, and role-based visibility.
- 📊 **Analytics Dashboard**: Usage reports, statistics, and financial summaries.
- 🛠️ **Complaint System**: Students can raise requests; managers can review and act.

---

## 🧰 Tech Stack

### 📦 Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT for Auth
- Multer for file uploads
- Nodemailer for email workflows

### 🎨 Frontend
- React.js + Vite
- Tailwind CSS
- React Query for API state
- React Hook Form for validation
- React Router for routing

---

## 📁 Project Structure

```
kgp-messhub/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # UI Components
│       ├── context/       # Context providers
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page-level components
│       ├── services/      # API integrations
│       ├── styles/        # Tailwind & global CSS
│       └── utils/         # Utility functions
├── server/                 # Node backend
│   ├── config/            # DB and app config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # Express routes
│   ├── utils/             # Utility functions
│   └── uploads/           # Uploaded files
├── docs/                   # API & usage documentation
└── README.md               # Project README
```

---

## 🛠️ Getting Started

### 🔧 Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

---

### 📦 Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kgp-messhub
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../server
   cp .env.example .env
   # Edit the .env file with your configuration
   ```

5. **Run development servers**

   **Backend**:
   ```bash
   cd server
   npm run dev
   ```

   **Frontend**:
   ```bash
   cd ../client
   npm run dev
   ```

---

## 🔌 API Documentation

### 🔐 Authentication

- `POST /api/auth/register` — Register Mess Manager  
- `POST /api/auth/login` — Login  
- `GET /api/auth/me` — Get current user info  
- `PUT /api/auth/profile` — Update profile  
- `PUT /api/auth/change-password` — Change password  

---

### 👥 Student Management

- `POST /api/students/upload-csv` — Upload student data  
- `GET /api/students` — Fetch all students  
- `POST /api/students/search` — Search by roll/name/year  
- `POST /api/students/:id/access` — Access student profile securely  

---

### 🧾 Order System

- `POST /api/orders` — Create new order  
- `GET /api/orders` — List all orders  
- `GET /api/orders/stats` — Order statistics  
- `PUT /api/orders/:id/status` — Update order/payment status  

---

## 🤝 Contributing

1. Fork the repository  
2. Create a new feature branch  
3. Make your changes  
4. Add tests (if applicable)  
5. Submit a pull request  

---

## 📄 License

Licensed under the **MIT License**.

---

## 📬 Support

For support or feedback, contact:  
📧 `support@kgpmesshub.com`  
📁 Or open an issue in the GitHub repository

---

> Built with ❤️ for the IIT Kharagpur student community.