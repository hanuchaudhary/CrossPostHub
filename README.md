<p align="center">
  <img src="public/landing.png" alt="CrossPostHub Workflow" width="100%"/>
</p>

---

## ✨ Introduction

**CrossPostHub** is your all-in-one, open-source social media management platform. Effortlessly post, schedule, and analyze content across LinkedIn, Twitter, Instagram, and more — all from a single, beautiful dashboard. Built for developers, creators, and teams who want to maximize their reach and productivity.

---

## 🏆 Key Features

- **Multi-Platform Posting**: Publish to LinkedIn, Twitter, Instagram, and more in one go
- **Smart Scheduling**: Schedule posts for optimal engagement times
- **Analytics Dashboard**: Track post performance with rich metrics
- **Secure Authentication**: Robust OAuth integrations for peace of mind
- **Real-time Preview**: See exactly how your posts will look before publishing
- **Modern UI/UX**: Intuitive, responsive design for all users
- **Open Source**: Fork, extend, and contribute freely

---

## 🖥️ Tech Stack & Integrations

<p align="center">
    <img src="https://skillicons.dev/icons?i=git,bun,nextjs,react,typescript,tailwind,nodejs,bash,postgres,docker,vercel,github,prisma,aws,vercel,gcp,mongodb,twitter,linkedin,instagram,&perline=10" alt="Tech Stack" />
</p>

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Node.js, Prisma ORM
- **Database:** PostgreSQL, MongoDB
- **Containerization:** Docker, Docker Compose
- **Deployment:** Vercel
- **Design:** Framer-Motion
- **CI/CD:** Github Actions

---

## 📸 Workflow Overview

<p align="center">
  <img src="public/main-workflow.jpeg" alt="CrossPostHub Workflow" width="80%"/>
</p>

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or bun
- Docker & Docker Compose (for containerized setup)

### 1. Local Development

```bash
# Clone the repository
git clone https://github.com/hanuchaudhary/CrossPostHub.git
cd CrossPostHub

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 2. Docker Compose (Recommended)

```bash
# Start all services (app, Postgres, Redis)
docker-compose up --build

# Stop services
docker-compose down
```

- The app will be available at [http://localhost:3000](http://localhost:3000)
- Database (Postgres) runs on port 5432, Redis on 6379

### 3. Environment Variables

Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
AUTH_SECRET=your_auth_secret
# Add other necessary environment variables
```

---

## 💻 Usage Guide

1. **Sign Up:** Create your free account
2. **Connect Platforms:** Link your social media accounts securely
3. **Create Content:** Use the post editor with real-time preview
4. **Schedule or Post:** Instantly publish or schedule for later
5. **Analyze:** Track engagement and performance (Premium)
6. **Upgrade:** Unlock advanced analytics and team features

---

## 💰 Pricing Plans

| Plan     | Integrations | Scheduling | Analytics | Team | Support |
|----------|--------------|------------|-----------|------|---------|
| Free     | Basic        | Limited    | -         | -    | Standard|
| Pro      | More         | Advanced   | Basic     | -    | Fast    |
| Premium  | Unlimited    | Advanced   | Advanced  | Yes  | Priority|

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and open issues or pull requests to help improve CrossPostHub.

---

## 👨‍💻 Author


<a href="https://github.com/hanuchaudhary">
    <table>
        <tbody>
            <tr>
                <td align="left" valign="top" width="14.28%">
                    <img src="https://github.com/hanuchaudhary.png?s=60" width="130px;"/>
                    <br/>
                    <h4 align="center">
                        <b>Kush Chaudhary</b>
                    </h4>
                    <div align="center">
                        <p>(Author)</p>
                    </div>
                </td>
                <td align="left" valign="top" width="85%">
                    <p>
                        👋 Hi there! I'm <u><em><strong>Kush Chaudhary</strong></em></u>, a self-taught Software Developer.
                    </p>
                    <ul>
                     <li>
                        Debugging React & Typescript ❤️ Building in Public
                    </li>
                </td>
            </tr>
        </tbody>
    </table>
</a>

---

## 📞 Support & Community

- Email: [hanuchaudharyog@gmail.com](mailto:hanuchaudharyog@gmail.com)