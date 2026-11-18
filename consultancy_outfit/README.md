# Consultancy Outfit - Professional Collaboration Platform

A Slack/Teams-inspired team collaboration platform with multi-company support, real-time chat, video meetings, and document sharing.

## 🚀 Features

- **Multi-Company Support** - Separate workspaces for different companies
- **Real-Time Chat** - Socket.io powered messaging with typing indicators
- **Team Management** - Create teams, add members, assign roles
- **Video Meetings** - WebRTC-based video conferencing UI
- **Document Sharing** - Upload, download, and share files
- **User Authentication** - JWT-based auth with refresh tokens
- **Online Status** - Real-time user presence (online/away/busy/offline)
- **Responsive Design** - Works on desktop and mobile

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| State | React Query, Context API |
| Real-time | Socket.io-client |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT, Bcrypt |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## 📁 Project Structure

```
consultancy_outfit/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── config/          # DB & Socket config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/                # React App
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth & Socket providers
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone / Create Project
```bash
cd d:\Reacts_harry\consultancy_outfit
```

### 2. Backend Setup
```bash
cd backend

# Copy env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# Then install dependencies
npm install

# Start backend
npm run dev
```
Backend runs on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`

### 4. Environment Variables (.env)
Create `backend/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/consultancy_outfit
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## 📖 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/status` - Update online status

### Companies
- `GET /api/companies` - List user's companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company details
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company
- `POST /api/companies/:id/members` - Add member
- `DELETE /api/companies/:id/members` - Remove member

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Messages
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get DM conversations
- `PUT /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id` - Get document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download file

### Users
- `GET /api/users` - List all users
- `GET /api/users/search?q=name` - Search users
- `GET /api/users/:id` - Get user by ID

## ⚡ Socket.io Events

### Client → Server
- `join_company` - Join company room
- `join_team` - Join team room
- `join_dm` - Join direct message room
- `send_message` - Send chat message
- `typing` / `stop_typing` - Typing indicator
- `call_user` / `answer_call` / `ice_candidate` / `end_call` - Call signaling

### Server → Client
- `receive_message` - New message received
- `incoming_call` - Incoming call notification
- `call_answered` - Call answered
- `call_ended` - Call ended

## 🎯 Next Steps (Production Ready)

1. **Database**: Connect to MongoDB Atlas for production
2. **File Upload**: Integrate Cloudinary/AWS S3 for document storage
3. **Video Calls**: Integrate WebRTC (SimplePeer) or Agora/Twilio SDK
4. **Notifications**: Add push notifications with Firebase
5. **Deployment**: Dockerize backend/frontend, deploy on AWS/DigitalOcean
6. **Tests**: Add Jest unit tests and Cypress E2E tests
7. **CI/CD**: Set up GitHub Actions pipeline

## 📄 License

MIT License - Consultancy Outfit

---

**Built with ❤️ for professional team collaboration**