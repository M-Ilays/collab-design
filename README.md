# Collab Design

Collab Design is a web app for student software teams. It keeps UML diagrams, requirements, team chat, and a discussion forum in one place, so a project does not have to be split across separate tools.

## Features

- **Projects.** Create a project, invite teammates by email, and track active, completed, and archived work.
- **Requirements.** Write structured requirements, comment on them, attach files, and export them as a PDF.
- **UML diagrams.** Draw diagrams in the browser, or generate a use case, class, or activity diagram from the project requirements.
- **Versions.** Save a snapshot of requirements and diagrams, review older snapshots, and restore one.
- **Team chat.** Real-time messages and file attachments inside a project.
- **Forum.** A shared discussion area for questions that are not tied to one project.
- **Accounts.** Email signup with verification, plus Google and GitHub sign-in.

## Repository layout

| Folder | Purpose |
|---|---|
| `frontend` | React app (Vite, Tailwind) |
| `backend` | Express API, MongoDB, Socket.io |
| `Apollon` | UML canvas. This is a local copy of the [Apollon](https://github.com/ls1intum/Apollon) editor. |

## Tech stack

MongoDB, Express, React, Node.js, Socket.io, and the Google Gemini API for generated diagrams.

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB connection string

## Run locally

Use two terminals.

**API**

```bash
cd backend
npm install
```

Create `backend/.env` with the variables listed below, then:

```bash
# PowerShell
$env:PORT = "3001"; node index.js
```

```bash
# macOS or Linux
PORT=3001 node index.js
```

The API listens on port **3001** because the frontend is configured to call `http://localhost:3001`. If you change that URL, set `PORT` to the same port.

**App**

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment variables

Put these in `backend/.env`. Do not commit that file.

| Variable | Used for |
|---|---|
| `DB_URL` | MongoDB connection string |
| `JWT_SECRET` | Login tokens |
| `PASSPORT_SECRET` | Session secret |
| `FRONT_APP_URL_DEV` | Frontend URL, for example `http://localhost:5173` |
| `BACKEND_URL` | API URL, for example `http://localhost:3001` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_FROM`, `MAIL_EMAIL`, `MAIL_PASSWORD` | Invitation and verification email |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub sign-in |
| `GEMINI_API_KEY` | Automatic UML generation |

For Google sign-in, the OAuth client needs this redirect URI:

`http://localhost:3001/api/auth/google/callback`

It must match `BACKEND_URL`.
