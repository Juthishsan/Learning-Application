# 📚 Comprehensive E-Learning Platform

A full-featured, AI-powered E-Learning Platform built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). This platform provides dedicated portals for **Learners**, **Instructors**, and **Administrators**, offering a seamless experience for course creation, enrollment, learning, and platform management.

### Platform Overview
This application enables educational institutions and independent instructors to create, deliver, and manage online courses. Learners can discover, purchase, and complete courses while instructors manage their content and track student progress. Administrators maintain platform integrity and oversee all operations.


## 🚀 Key Features

### 🎓 Learner Portal
* **Course Catalog & Search**: Browse, search, and discover a wide variety of courses with advanced filtering options
* **Interactive Learning**: Watch course videos, read materials, take quizzes, and track progress in real-time
* **Personalized Dashboard**: View enrolled courses, track learning progress, certificates earned, and activity history
* **Shopping Cart & Secure Checkout**: Add courses to cart, apply discounts, and securely purchase via Razorpay or Stripe
* **AI Chatbot Assistant**: Integrated AI chatbot powered by Groq to answer course-related queries and provide support
* **Certificate Generation**: Automatic certificate generation upon course completion with PDF download
* **Course Reviews & Ratings**: Leave reviews and rate courses to help other learners
* **Discussion Forums**: Engage with instructors and peers in course discussion boards
* **Personalization Settings**: Customize learning preferences and notification settings

### 👨‍🏫 Instructor Portal
* **Comprehensive Course Management**: Create, edit, delete, and organize courses with multiple modules and lessons
* **Media Management**: Upload course thumbnails, videos, and resources seamlessly via Cloudinary
* **Student Progress Tracking**: Monitor enrolled students, view detailed progress, and identify struggling learners
* **Grading System**: Create assignments, grade student submissions, and provide feedback
* **Earnings Dashboard**: Track course sales, revenue, commissions, and financial analytics
* **Performance Analytics**: View course statistics, enrollment trends, and student engagement metrics
* **Profile Management**: Customize instructor profile, bio, expertise areas, and settings
* **Announcement Management**: Send course announcements to all enrolled students

### 🛡️ Admin Portal
* **Global Dashboard**: Comprehensive analytics with total users, active courses, revenue, and platform health metrics
* **User Management**: Manage learners and instructors, view profiles, deactivate accounts, and handle disputes
* **Course Approval System**: Review and approve/reject instructor-submitted courses
* **Financial Overview**: Detailed financial reports, earnings distribution, transaction history, and platform revenue
* **Activity Logs**: Track all user activities, logins, purchases, and platform events
* **Platform Settings**: Configure application-wide settings, payment gateways, and system parameters
* **Notification Management**: Send bulk notifications to users and manage notification settings
* **Admin Profile & Security**: Manage admin accounts with secure login and password management

---

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

## �️ Tech Stack

### Frontend
- **React.js** (v19.2.3) - UI Library
- **React Router** (v7.12.0) - Client-side routing and navigation
- **Framer Motion** (v12.27.1) - Smooth animations and transitions
- **Recharts** (v3.7.0) - Interactive data visualization and charts
- **React Hot Toast** (v2.6.0) - Toast notifications
- **Lucide React** (v0.562.0) - Icon library
- **Axios** (v1.13.2) - HTTP client
- **React Markdown** (v10.1.0) - Markdown rendering
- **html2canvas & jsPDF** - PDF generation for certificates

### Backend
- **Node.js & Express.js** (v4.18.2) - Server and REST API framework
- **MongoDB & Mongoose** (v8.0.3) - NoSQL database and ODM
- **Cloudinary** (v1.41.3) - Cloud media storage and optimization
- **Multer** (v2.0.2) - File upload middleware
- **Groq SDK** (v1.1.1) - AI integration for chatbot
- **Razorpay** (v2.9.6) & **Stripe** (v20.3.1) - Payment gateway integration
- **bcryptjs** (v3.0.3) - Password hashing
- **CORS** (v2.8.5) - Cross-origin resource sharing
- **dotenv** (v16.3.1) - Environment variable management

---

## 📊 Database Models

### Core Models:
- **User** - Learner accounts with profile, enrolled courses, cart, and activity logs
- **Instructor** - Instructor profiles with courses created, earnings, and student reviews
- **Admin** - Administrator accounts with full platform access
- **Course** - Course details including title, description, modules, price, ratings
- **Discussion** - Course discussion threads and comments
- **Notification** - User notifications and alerts
- **ActivityLog** - Platform activity tracking for audit purposes
- **Contact** - Contact form submissions
- **CourseReview** - Learner reviews and ratings for courses

---

## 📁 Project Structure

```
learning-platform/
├── server/                     # Backend (Node.js + Express)
│   ├── config/
│   │   └── cloudinary.js       # Cloudinary configuration
│   ├── models/
│   │   ├── User.js             # Learner model
│   │   ├── Instructor.js       # Instructor model
│   │   ├── Admin.js            # Admin model
│   │   ├── Course.js           # Course model
│   │   ├── Discussion.js       # Discussion model
│   │   ├── Notification.js     # Notification model
│   │   ├── ActivityLog.js      # Activity logging
│   │   └── Contact.js          # Contact submissions
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── users.js            # User management
│   │   ├── courses.js          # Course operations
│   │   ├── instructors.js      # Instructor endpoints
│   │   ├── admin.js            # Admin operations
│   │   ├── cart.js             # Shopping cart
│   │   ├── ai.js               # AI/Chatbot endpoints
│   │   ├── contact.js          # Contact form
│   │   ├── discussions.js      # Discussion forums
│   │   └── notifications.js    # Notification handling
│   ├── seeding/
│   │   ├── seed.js             # General database seeding
│   │   └── seedAdmin.js        # Admin user seeding
│   ├── index.js                # Server entry point
│   └── package.json            # Backend dependencies
│
├── src/                        # Frontend (React)
│   ├── assets/                 # Images, fonts, media files
│   ├── components/
│   │   ├── Admin/
│   │   │   └── AdminSidebar.jsx
│   │   ├── Chatbot/
│   │   │   └── Chatbot.jsx     # AI Chatbot component
│   │   ├── Common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── Instructor/
│   │   │   ├── InstructorSidebar.jsx
│   │   │   └── GradebookModal.jsx
│   │   ├── Learner/
│   │   │   ├── CustomVideoPlayer.jsx
│   │   │   ├── CourseReviews.jsx
│   │   │   └── CertificateModal.jsx
│   │   └── Modals/
│   │       ├── ConfirmModal.jsx
│   │       ├── EditProfileModal.jsx
│   │       ├── ChangePasswordModal.jsx
│   │       ├── GradeStudentModal.jsx
│   │       ├── AnnounceModal.jsx
│   │       └── PersonalizationModal.jsx
│   ├── context/                # Global state (Context API)
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── Learner/
│   │   │   ├── Home.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseOverview.jsx
│   │   │   ├── CourseContent.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── About.jsx
│   │   │   └── Contact.jsx
│   │   ├── Instructor/
│   │   │   ├── InstructorDashboard.jsx
│   │   │   ├── InstructorCourses.jsx
│   │   │   ├── InstructorCourseDetails.jsx
│   │   │   ├── InstructorStudents.jsx
│   │   │   ├── InstructorEarnings.jsx
│   │   │   ├── InstructorProfile.jsx
│   │   │   └── InstructorSettings.jsx
│   │   └── Admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── AdminInstructors.jsx
│   │       ├── AdminCourses.jsx
│   │       ├── AdminEarnings.jsx
│   │       ├── AdminProfile.jsx
│   │       └── AdminSettings.jsx
│   ├── styles/                 # Global and page-specific styles
│   ├── App.jsx                 # Main routing component
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
│
├── public/
│   ├── index.html              # HTML template
│   └── manifest.json           # PWA manifest
├── build/                      # Production build output
├── package.json                # Frontend dependencies
└── README.md                   # This file
```

---

## ⚙️ Environment Variables

### Backend Setup (.env file in server/ directory)

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/learning-platform

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AI Chatbot (Groq)
GROQ_API_KEY=your_groq_api_key

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Payment Gateway - Stripe (Alternative)
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# Email Service (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### Frontend Setup (.env file in root directory - Optional)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Usually comes with Node.js
- **MongoDB** (v4.0 or higher) - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Postman** (Optional) - For API testing

### External Accounts Required:
- **Cloudinary Account** - For media storage ([Sign up](https://cloudinary.com/))
- **Groq Account** - For AI chatbot ([Sign up](https://console.groq.com/))
- **Razorpay/Stripe Account** - For payment processing ([Razorpay](https://razorpay.com/) / [Stripe](https://stripe.com/))
- **MongoDB Atlas Account** - For cloud database ([Sign up](https://www.mongodb.com/cloud/atlas))

---

## 🚀 Getting Started

Follow these step-by-step instructions to set up the project locally:

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/learning-platform.git
cd learning-platform
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

### Step 4: Configure Environment Variables

#### For Backend:
Create a `.env` file in the `server` directory:
```bash
cd server
cp .env.example .env  # if .env.example exists
# Edit .env with your credentials (see Environment Variables section above)
```

#### For Frontend (Optional):
Create a `.env` file in the root directory if needed

### Step 5: Initialize Database (Optional)
To seed the database with sample data:
```bash
cd server
npm run seed
```

### Step 6: Start the Application

**Option A: Run Both Services Simultaneously**

Terminal 1 - Start Backend:
```bash
cd server
npm run dev
```
Backend runs on: `http://localhost:5000`

Terminal 2 - Start Frontend:
```bash
npm start
```
Frontend runs on: `http://localhost:3000`

**Option B: Start Individual Services**

Backend only:
```bash
cd server
npm start  # or npm run dev for development
```

Frontend only:
```bash
npm start
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### User Routes (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /enrolled-courses` - Get enrolled courses
- `GET /dashboard` - Get user dashboard data
- `PUT /change-password` - Change password

### Course Routes (`/api/courses`)
- `GET /` - Get all courses
- `GET /:id` - Get course details
- `POST /` - Create new course (Instructor)
- `PUT /:id` - Update course (Instructor)
- `DELETE /:id` - Delete course (Instructor)
- `GET /search` - Search courses
- `POST /:id/enroll` - Enroll in course (Learner)

### Instructor Routes (`/api/instructors`)
- `GET /dashboard` - Get instructor dashboard
- `GET /earnings` - Get earnings data
- `GET /students` - Get enrolled students
- `PUT /grade/:studentId` - Grade student submission

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Get admin dashboard
- `GET /users` - Get all users
- `GET /courses` - Get all courses
- `GET /earnings` - Get platform earnings
- `PUT /users/:id/status` - Update user status

### Cart Routes (`/api/cart`)
- `POST /add` - Add course to cart
- `DELETE /remove/:courseId` - Remove from cart
- `GET /` - Get cart items
- `POST /checkout` - Proceed to checkout

### Payment Routes (`/api/payments`)
- `POST /razorpay` - Razorpay payment
- `POST /stripe` - Stripe payment
- `POST /verify` - Verify payment

### Discussion Routes (`/api/discussions`)
- `GET /course/:courseId` - Get course discussions
- `POST /` - Create discussion
- `POST /:id/reply` - Reply to discussion

### Chatbot Routes (`/api/ai`)
- `POST /chat` - Send message to AI chatbot

### Notification Routes (`/api/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark as read

### Contact Routes (`/api/contact`)
- `POST /submit` - Submit contact form

---

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing (if implemented)
```bash
cd server
npm test
```

### API Testing with Postman
1. Import the API collection into Postman
2. Configure environment variables
3. Test individual endpoints

---

## 📝 Usage Guide

### For Learners:
1. Sign up or log in
2. Browse available courses
3. Add courses to cart
4. Proceed to checkout and complete payment
5. Start learning from course dashboard
6. Track progress and access resources
7. Complete course to earn certificate

### For Instructors:
1. Sign up as instructor
2. Create new courses
3. Upload course materials and videos
4. Set pricing and publish course
5. Monitor student enrollment and progress
6. Grade assignments and provide feedback
7. Track earnings on dashboard

### For Administrators:
1. Log in with admin credentials
2. Monitor platform analytics
3. Manage users and courses
4. Review financial reports
5. Configure platform settings
6. Handle disputes and support

---

## 🐛 Troubleshooting

### Common Issues and Solutions:

**Issue: MongoDB Connection Error**
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check `MONGO_URI` in .env file
- Verify network access in MongoDB Atlas IP whitelist

**Issue: Cloudinary Upload Fails**
- Verify Cloudinary credentials in .env
- Check file size limits
- Ensure proper file formats

**Issue: Payment Gateway Errors**
- Verify API keys for Razorpay/Stripe
- Check if account is in test/production mode
- Ensure proper webhook configuration

**Issue: Port Already in Use**
- Kill process using port: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
- Or change PORT in .env

**Issue: CORS Errors**
- Verify CORS configuration in server
- Check frontend URL in backend CORS settings
- Ensure requests include proper headers

---

## 📚 Learning Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Cloudinary API Reference](https://cloudinary.com/documentation)
- [Groq API Documentation](https://console.groq.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Stripe Documentation](https://stripe.com/docs)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Coding Standards:
- Follow consistent naming conventions
- Comment complex logic
- Write clean, readable code
- Test your changes before submitting
- Update README if adding new features

---

## 📄 License

This project is open-source and available under the **ISC License**. See the [LICENSE](LICENSE) file for details.

---

## 👥 Authors & Contributors

- **Initial Developer**: [Your Name]
- **Contributors**: Welcome! Fork and contribute.

---

## 📞 Support & Contact

For support, questions, or feedback:
- Open an issue on GitHub
- Contact via email: support@learningplatform.com
- Visit our website: [www.learningplatform.com](https://www.learningplatform.com)

---

## 🎯 Future Roadmap

- [ ] Mobile app (React Native)
- [ ] Live streaming classes
- [ ] Advanced gamification features
- [ ] Peer-to-peer learning
- [ ] API rate limiting and optimization
- [ ] Advanced search with filters
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Certificate blockchain verification
- [ ] Analytics dashboard improvements

---

## ⭐ Show Your Support

If you find this project helpful, please consider:
- Starring the repository ⭐
- Sharing with your network
- Contributing to the project
- Providing feedback

---

**Last Updated**: April 28, 2026  
**Version**: 1.0.0
