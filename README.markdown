# 🍽️ KGP MessHub

A full-featured mess management web application prototype built for the hostel messes at IIT Kharagpur. Designed to streamline student transactions, inventory, and order tracking with a secure multi-role access system.

---

## 📄 Overview

KGP MessHub is a prototype web application born from my desire to digitize and improve hostel mess operations at IIT Kharagpur. My goal was to create a simple, transparent, and efficient system that reduces manual workloads for mess managers while enhancing the student experience. As someone new to web development, I explored this project with the help of AI tools like Claude, which enabled me to prototype my ideas in a website format. This project is still incomplete, serving as a proof of concept to showcase my vision, and I hope it inspires others to build upon or continue its development.

---

## 📄 Motivation

As a student at IIT Kharagpur, I observed the inefficiencies in the hostel mess system that inspired this project. My primary motivation was to digitize the manual mess book system, which required managers to painstakingly count records for every student, often leading to errors and inefficiencies in daily accounting. I also noticed challenges like students manually ticking names off lists for Grand Dinners, which led to misuse (e.g., students from other halls attending events they weren’t eligible for), and last-minute menu changes that weren’t communicated effectively, leaving students uninformed. These experiences drove me to envision a system that automates processes, ensures transparency, and improves fairness for all stakeholders.

---

## 🚀 Implemented Features

- 🔐 **Multi-Role Authentication**: Admin approval for Mess Managers before login.
- 🧾 **Student Management**: Upload CSVs, manage profiles, and track balances.
- 🛒 **Order System**: Real-time cart, batch checkout, and order history tracking.
- 🗝️ **Secure Access Control**: Secret keys, manager overrides, and role-based visibility.
- 📊 **Analytics Dashboard**: Usage reports, statistics, and financial summaries.
- 🛠️ **Complaint System**: Students can raise requests; managers can review and act.

---

## 🌟 Ideas for Future Development

I envision KGP MessHub evolving further to address additional challenges. Here are some ideas I’m exploring, and I welcome suggestions from contributors to make this system more robust:

- **Student Dashboard** 🎓  
  - View today’s and upcoming mess menus.  
  - See real-time dish changes announced by managers.  
  - Access a personalized dashboard for meal registrations and event updates.

- **Grand Dinner Automation** 🎉  
  - Managers can initiate a Grand Dinner or Snacks event.  
  - Generate unique QR codes for each student in the hall for event entry.  
  - Students display their QR code, which managers scan to validate hall membership and track participation.  
  - Display participation counts in the manager dashboard to monitor attendance.

- **Mess Inventory Management** 📦  
  - Track daily food preparation and waste to minimize overproduction.  
  - Monitor plate counts (veg/non-veg) per session and gather feedback on student preferences to understand popular dishes.  
  - Manage ingredient inventory (e.g., salt, chicken, dal), recording stock levels and usage per dish each day.  
  - Generate insights through charts, helping managers optimize resources and reduce waste.

- **Additional Enhancements** 🚀  
  - Enable managers to post last-minute dish changes, instantly visible to students.  
  - Allow students to rate meals daily, with analytics to help managers improve food quality.  
  - Ensure cross-hall security so students can only participate in their hall-specific events through secure validation.  
  - Automate coupon generation for limited-distribution events, reducing manual effort and ensuring fairness.

I believe this hub could grow into a broader hostel management ecosystem, potentially integrating inventory management, financial tracking, and more.

---

## 📸 Website Preview

Here are some previews of the current prototype:

- ![🏠 Welcome Screen](./assets/home.png)  
- ![ℹ️ About KGP MessHub](./assets/about.png)  
- ![👩‍💼 Admin Control Panel](./assets/admin-dashboard.png)  
- ![🍽️ Manager Overview](./assets/manager-dashboard.png)  
- ![🎓 Student Dashboard (Coming Soon)](./assets/student-dashboard.png)

---

## 🛠️ Tech Stack

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

### 🔌 Additional Tech (Proposed)
- **QR Code Generation & Scanning**: To be explored (e.g., using libraries like `qrcode` for generation and a scanning solution for validation)

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
└── README.md               # Project README
```

---

## 🛠️ Getting Started

### 🔧 Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

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

### 👥 Student Management
- `POST /api/students/upload-csv` — Upload student data  
- `GET /api/students` — Fetch all students  
- `POST /api/students/search` — Search by roll/name/year  
- `POST /api/students/:id/access` — Access student profile securely  

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

## 📬 Support

For support or feedback, contact:  
📧 `harilakshman24@gmail.com`  
📁 Or open an issue in the GitHub repository

---

## 🙏 Call for Collaboration

This prototype is a work in progress, showcasing my ideas in a website format to address real-world challenges in hostel mess management. It’s still incomplete, and I’m eager to collaborate with others to bring these ideas to life. I invite contributors to fork this repository, take inspiration to create their own versions, or continue editing this project. As I continue to learn web development, I hope we can work together to build a system that truly serves the IIT Kharagpur student community.

---

> Conceptualized with ❤️ for the IIT Kharagpur student community.