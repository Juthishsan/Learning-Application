# Comprehensive E-Learning Platform

A full-featured, AI-powered E-Learning Platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This platform provides dedicated portals for Learners, Instructors, and Administrators, offering a seamless experience for course creation, enrollment, learning, and platform management.

## 🚀 Features

### 🎓 Learner Portal
* **Course Catalog & Search**: Browse, search, and discover a wide variety of courses.
* **Interactive Learning**: Watch course videos, read materials, and track progress.
* **AI Chatbot Assistant**: Integrated AI chatbot powered by Groq to assist with course queries.
* **Cart & Checkout**: Add courses to the cart and securely purchase them via Razorpay/Stripe.
* **Dashboard & Profile**: Track enrolled courses, learning progress, and manage personal information.

### 👨‍🏫 Instructor Portal
* **Course Management**: Create, update, and manage courses, modules, and lessons.
* **Media Uploads**: Upload course thumbnails and video content seamlessly via Cloudinary.
* **Student Tracking**: Monitor enrolled students and their progress.
* **Earnings Dashboard**: Track course sales and total revenue.
* **Profile Management**: Customize instructor profile and settings.

### 🛡️ Admin Portal
* **Global Dashboard**: View platform-wide analytics, total users, active courses, and revenue.
* **User Management**: Manage learners and instructors on the platform.
* **Financial Overview**: Detailed reports on earnings and platform fees.
* **Platform Settings**: Configure global application settings.

## 🛠️ Tech Stack

### Frontend
* **React.js**: UI Library
* **React Router**: Navigation
* **Framer Motion**: Animations and transitions
* **Recharts**: Data visualization and charts
* **React Hot Toast**: Notifications
* **Lucide React**: Iconography

### Backend
* **Node.js & Express.js**: Server and API framework
* **MongoDB & Mongoose**: Database and ODM
* **Cloudinary & Multer**: File and media storage
* **Groq SDK**: AI integration for the chatbot
* **Razorpay / Stripe**: Payment gateway integration

## 📁 Project Structure

```text
learning-platform/
├── server/                 # Backend Node.js & Express app
│   ├── config/             # Configuration files
│   ├── models/             # Mongoose database models
│   ├── routes/             # API endpoints
│   ├── seeding/            # Database seeders
│   ├── index.js            # Entry point for backend
│   └── package.json        # Backend dependencies
├── src/                    # Frontend React app
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable React components (Navbar, Footer, Chatbot, etc.)
│   ├── context/            # Global state management
│   ├── pages/              # Page components (Admin, Auth, Instructor, Learner)
│   ├── App.jsx             # Main routing component
│   └── index.css           # Global styles
├── package.json            # Frontend dependencies
└── README.md               # Project documentation
```

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

# Cloudinary Integration (for media uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Chatbot Integration
GROQ_API_KEY=your_groq_api_key

# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository
```bash
git clone <repository-url>
cd learning-platform
```

### 2. Install dependencies

**For the Frontend:**
```bash
npm install
```

**For the Backend:**
```bash
cd server
npm install
```

### 3. Set up the Environment Variables
Create a `.env` file in the `server` directory and add the necessary credentials as shown in the Environment Variables section.

### 4. Run the Application

**Start the Backend Server:**
Open a terminal, navigate to the `server` directory, and run:
```bash
npm run dev
```
The backend server will start on `http://localhost:5000`.

**Start the Frontend Development Server:**
Open a new terminal, navigate to the root directory, and run:
```bash
npm start
```
The React application will start on `http://localhost:3000`.

## 📜 License
This project is open-source and available under the ISC License.
