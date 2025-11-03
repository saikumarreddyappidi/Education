# EduConnect - Comprehensive Educational Platform

A comprehensive full-stack web application designed for seamless teacher-student collaboration and educational excellence. EduConnect brings together note-taking, whiteboard tools, PDF management, real-time assignment submission, interactive discussion forums, and instant notifications—all in one unified platform.

## 🎯 Problem Statement & Solution

### The Challenge
In online classes, students and teachers face communication gaps:
- Students miss assignments or deadlines
- Teachers struggle to manage submissions and provide timely feedback
- There's no centralized place for sharing materials or discussions
- Learning becomes unorganized and confusing

### Our Solution
EduConnect bridges these gaps by providing a single, intuitive platform where:
- **Teachers** can post assignments, share materials, grade work, and answer questions in real-time
- **Students** can view assignments, submit work, ask questions, and receive instant notifications
- Everyone stays connected and organized

## 🚀 Features

### 🔐 Authentication System
- **User Registration**: Students and Staff with role-based registration
- **Secure Login**: JWT-based authentication
- **Role Management**: Different interfaces and permissions for Students and Staff
- **Teacher Codes**: Unique codes for staff to share notes with students

### 📝 Notepad
- **Rich Text Editor**: Powered by Quill.js for advanced formatting
- **Tag System**: Organize notes with custom tags (#project, #calculus, etc.)
- **Search Functionality**: Search by title, content, or tags
- **Note Sharing**: Staff can share notes with students using Teacher Codes
- **CRUD Operations**: Full create, read, update, delete functionality

### 🎨 Whiteboard / Paint Tool
- **Drawing Canvas**: HTML5 Canvas with react-canvas-draw
- **Drawing Tools**: Pen with customizable color and size
- **Eraser Tool**: Remove parts of drawings
- **Save Drawings**: Export as PNG and save to cloud storage
- **Drawing Management**: View, load, and delete saved drawings

### 📄 PDF Manager
- **PDF Upload**: Upload and manage PDF documents
- **PDF Viewer**: Built-in viewer using PDF.js
- **Annotations**: 
  - Highlight text
  - Add text boxes
  - Draw on PDFs
- **Save Annotations**: Persistent annotation storage

### 👨‍🏫 Teacher-Student System
- **Teacher Codes**: Staff generate unique codes for their classes
- **Note Sharing**: Teachers can share notes tagged with their Teacher Code
- **Student Access**: Students with matching Teacher Codes see shared notes
- **Role-based Features**: Different capabilities for Students vs Staff

### 📚 Assignment System
- **Assignment Creation**: Teachers can create assignments with titles, descriptions, and deadlines
- **File Attachments**: Upload study materials, rubrics, and resources
- **Student Submission**: Students submit assignments with file uploads
- **Grading & Feedback**: Teachers can grade submissions and provide detailed feedback
- **Submission Tracking**: View submission status (pending, submitted, graded)
- **Deadline Alerts**: Automatic notifications when deadlines approach
- **Grade Distribution**: Teachers can view analytics on assignment performance

### 💬 Discussion Forum
- **Topic Creation**: Teachers and students can start discussion threads
- **Q&A Format**: Questions, answers, and peer-to-peer support
- **Threaded Comments**: Reply to specific messages with full conversation context
- **Search**: Find past discussions and answers instantly
- **Moderation**: Teachers can pin important answers and manage discussions
- **Reputation System**: Students gain recognition for helpful answers

### 🔔 Real-Time Notifications
- **Assignment Updates**: Notify students when new assignments are posted
- **Submission Reminders**: Alerts for upcoming deadlines
- **Feedback Notifications**: Instant alerts when grades are posted
- **Discussion Replies**: Get notified of new replies in discussion threads
- **Message Alerts**: Receive notifications for direct messages
- **Notification Dashboard**: Centralized view of all notifications
- **Email Integration**: Optional email notifications for critical updates

### 📤 Enhanced File Management
- **Multi-format Support**: Upload and share PDFs, documents, images, and videos
- **File Organization**: Organize files by assignment, subject, or category
- **File Previews**: Quick preview without downloading
- **Version Control**: Maintain file versions and revision history
- **Access Control**: Set permissions for who can view/download files
- **Collaborative Annotations**: Comment and annotate shared files

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Redux Toolkit** for state management
- **React Router** for navigation
- **React Quill** for rich text editing
- **React Canvas Draw** for whiteboard functionality
- **PDF.js** for PDF viewing and annotation
- **Socket.io-client** for real-time notifications
- **React Toastify** for notification UI
- **Axios** for API calls with interceptors

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time notifications
- **Multer** for file uploads
- **AWS S3** for file storage
- **bcryptjs** for password hashing
- **Bull** for job queue (for background notifications)
- **Nodemailer** for email notifications

### Database
- **MongoDB** for primary data storage
- **Text indexing** for search functionality
- **GridFS** or **AWS S3** for file storage

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- AWS Account (for S3 storage)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configurations
# - MongoDB connection string
# - JWT secret
# - AWS credentials

npm run dev
```

### Environment Variables (.env)
```env
NODE_ENV=development
PORT=5003
MONGODB_URI=mongodb://localhost:27017/nannotes
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=nannotes-uploads
CORS_ORIGINS=http://localhost:3000

# Real-time Notifications (Socket.io)
SOCKET_IO_ENABLED=true

# Email Notifications (Optional)
SMTP_SERVICE=gmail
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=EduConnect

# Job Queue (Bull)
REDIS_URL=redis://localhost:6379
```

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd nannotes
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Set up environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your configurations
```

4. **Start the development servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5003

## 📱 Usage

### For Students
1. **Register** with registration number, password, year, semester, course
2. **Optional**: Enter Teacher Code to access shared notes and assignments
3. **Dashboard**: View assignments, due dates, and submit work
4. **Create Notes**: Write and organize personal notes with tags
5. **Use Whiteboard**: Create drawings and sketches for brainstorming
6. **Manage PDFs**: Upload, view, and annotate PDF documents
7. **Submit Assignments**: Upload files and submit work before deadlines
8. **View Grades**: Check feedback and grades from teachers
9. **Participate in Discussions**: Ask questions and help peers
10. **Stay Informed**: Receive instant notifications for new assignments and feedback

### For Staff
1. **Register** with registration number, password, subject, year/semester
2. **Receive Teacher Code**: Automatically generated unique code
3. **Create and Share Notes**: Write notes and mark them as shared
4. **Manage Content**: Full access to personal notes and drawings
5. **Share Teacher Code**: Provide code to students for note access
6. **Create Assignments**: Post assignments with deadlines and attachments
7. **Manage Submissions**: Track student submissions and completion
8. **Grade & Feedback**: Evaluate work and provide detailed feedback
9. **Start Discussions**: Create discussion forums for Q&A
10. **Send Notifications**: Alert students about important updates
11. **Track Progress**: View analytics on assignment performance

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Notes
- `GET /api/notes` - Get user's notes + shared notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search` - Search notes

### Assignments
- `GET /api/assignments` - Get assignments (filters by role)
- `POST /api/assignments` - Create new assignment (teachers only)
- `PUT /api/assignments/:id` - Update assignment (teachers only)
- `DELETE /api/assignments/:id` - Delete assignment (teachers only)
- `GET /api/assignments/:id` - Get assignment details with submissions
- `GET /api/assignments/:id/submissions` - Get all submissions for assignment

### Submissions
- `GET /api/submissions` - Get user's submissions
- `POST /api/assignments/:id/submit` - Submit assignment
- `PUT /api/submissions/:id` - Resubmit assignment
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions/:id/grade` - Grade submission (teachers only)
- `POST /api/submissions/:id/feedback` - Add feedback (teachers only)

### Discussions
- `GET /api/discussions` - Get all discussion threads
- `POST /api/discussions` - Create new discussion thread
- `GET /api/discussions/:id` - Get thread with all replies
- `POST /api/discussions/:id/reply` - Reply to discussion thread
- `PUT /api/discussions/:id/reply/:replyId` - Edit reply
- `DELETE /api/discussions/:id/reply/:replyId` - Delete reply
- `POST /api/discussions/:id/pin` - Pin discussion (teachers only)
- `GET /api/discussions/search` - Search discussions

### Notifications
- `GET /api/notifications` - Get user's notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `PUT /api/users/:id/notification-settings` - Update notification preferences

### Files
- `POST /api/files/upload` - Upload file to S3
- `GET /api/files/signed-url/:fileName` - Get signed URL
- `DELETE /api/files/:fileName` - Delete file
- `GET /api/files/:id/versions` - Get file version history

## 📋 Role-Based Access

### Student Permissions

- Create, read, update, delete personal notes
- Create, save, and delete whiteboard drawings
- Upload, view, and annotate PDF documents
- Enter teacher codes to access shared notes
- View notes shared by teachers
- View assigned assignments and due dates
- Submit assignments with file attachments
- View grades and feedback on submissions
- Participate in discussion forums
- Ask questions and answer peers
- Receive notifications for new assignments and feedback
- Download study materials and resources

### Staff Permissions

- All student permissions
- Receive automatically generated unique teacher codes
- Mark notes as shareable with teacher code
- View student engagement with shared notes
- Manage shared content visibility
- Create and publish assignments
- Set assignment deadlines and rubrics
- Grade student submissions with feedback
- View comprehensive assignment analytics
- Create and moderate discussion forums
- Pin important answers
- Send notifications to students
- Manage course materials and resources
- Track student progress and performance

## 💾 Database Models

### User Model
- Registration information (number, password)
- Role designation (student/staff)
- Academic details (year, semester, course, subject)
- Teacher codes (auto-generated for staff)
- Authentication tokens and sessions
- Notification preferences

### Note Model
- Title and rich text content
- Tags for organization
- Author information
- Creation and modification timestamps
- Sharing status and teacher code reference
- Access control metadata

### Assignment Model
- Title, description, and instructions
- Teacher/creator reference
- Due date and deadline
- Attached files and resources
- Grading rubric
- Class or section reference
- Status (draft, published, closed)

### Submission Model
- Assignment reference
- Student reference
- Submitted files and content
- Submission timestamp
- Grade and feedback
- Revision history
- Late submission flag

### Discussion Model
- Thread title and original post
- Creator and contributors
- Tags and category
- Replies and nested comments
- Pin status and views count
- Timestamps and editing history
- Attachment support

### Notification Model
- User reference
- Notification type (assignment, submission, reply, feedback)
- Associated entity reference
- Read/unread status
- Timestamp
- Action URL

## �🗂 Project Structure

```
nannotes/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/         # Redux store and slices
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── styles/        # Tailwind CSS styles
│   └── public/
├── backend/
│   ├── src/
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # Express routes
│   │   ├── middleware/    # Custom middleware
│   │   └── server.ts      # Main server file
│   └── dist/             # Compiled JavaScript
└── shared/               # Shared utilities and types
```

## 🔒 Security Features

- **Password Validation**: Complex password requirements
  - Minimum 8 characters, includes upper/lowercase, digit, and special character
- **JWT Authentication**: Secure token-based auth
- **Role-based Access**: Different permissions for students/staff
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: Security headers for Express

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build folder
```

### Backend (AWS EC2/Heroku)
```bash
cd backend
npm run build
npm start
```

### Database (MongoDB Atlas)
- Set up MongoDB Atlas cluster
- Update MONGODB_URI in environment variables

### File Storage (AWS S3)
- Create S3 bucket
- Configure IAM user with S3 permissions
- Update AWS credentials in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **EduConnect Development Team** (formerly NANNOTES)

## 🎓 Quick Feature Guide

### For Teachers Getting Started
1. Create an assignment in your dashboard
2. Set a deadline and add rubric points
3. Upload study materials or example files
4. Share your Teacher Code with students
5. Monitor submissions in real-time
6. Grade work and add feedback
7. Post discussion questions for the class

### For Students Getting Started
1. Enter your teacher's code to join the class
2. Check your assignment dashboard daily
3. Download materials and read requirements
4. Submit work before the deadline
5. Check your grades and feedback
6. Participate in class discussions
7. Ask questions anytime

## 🆘 Support

For support, email team@educonnect.com or create an issue in the repository.

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core assignment management
- ✅ Real-time notifications
- ✅ Discussion forums
- ✅ File management

### Phase 2 (Planned)
- Live class integration
- Video recording and playback
- Peer review system
- Attendance tracking
- Advanced analytics and reporting

### Phase 3 (Future)
- Mobile applications (iOS/Android)
- AI-powered plagiarism detection
- Adaptive learning recommendations
- Integration with external platforms (Google Classroom, Canvas)
- Multilingual support

---

**EduConnect** - Bridging the Gap Between Teachers and Students 🚀

Transforming Education Through Technology and Collaboration �✨
