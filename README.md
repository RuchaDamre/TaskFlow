# TaskFlow

A full-stack Trello clone designed for users to efficiently manage tasks and projects through a clean, responsive, and interactive Kanban-style interface.

# ✨ Key Features

- Secure user authentication with **Clerk**  
- Create, edit, and delete **boards, columns, and tasks**  
- Drag-and-drop task management  
- Filter tasks based on custom criteria  
- Responsive, mobile-first UI built with **Tailwind CSS**  
- Fully integrated with **Supabase** backend for persistent data  

# 🛠️ Tech Stack

- **Frontend:** React, Next.js, TypeScript, Tailwind CSS  
- **Authentication:** Clerk  
- **Database & Backend:** Supabase (PostgreSQL)  

# 🚀 Getting Started

## Prerequisites

- Node.js (v18+ recommended)  
- Supabase account  
- Clerk account  

## Installation

### Clone the repository
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
Install dependencies
bash
Copy code
npm install
# or
yarn
Setup environment variables
Create a .env.local file:

env
Copy code
# Clerk
NEXT_PUBLIC_CLERK_FRONTEND_API=pk_test_your_publishable_key
CLERK_API_KEY=sk_test_your_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
Start the development server
bash
Copy code
npm run dev
# or
yarn dev
Open http://localhost:3000 to view the app.

🔐 Authentication
Users can securely sign up and sign in using Clerk authentication.
All authentication flows are handled automatically.

📌 Project Highlights
Modular React component architecture for scalability

Clean UI built with Tailwind CSS

Real-world task management use case similar to Trello

Integration with Supabase for real-time data persistence

Fully responsive and mobile-friendly

🌐 Deployment
Frontend: Vercel (free hosting for Next.js)

Backend/Database: Supabase (free tier for Postgres database)

Authentication: Clerk (free tier for user management)

👩‍💻 Author
Rucha Damre
Frontend Engineer | React Developer

📧 Email: ruchadamre2000@gmail.com
🔗 LinkedIn: https://www.linkedin.com/in/rucha-damre-23392119a/
🐙 GitHub: https://github.com/RuchaDamre






