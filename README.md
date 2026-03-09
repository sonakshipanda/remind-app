# REMIND

**Reflect, Evolve, Make Informed New Decisions**

REMIND is an AI-powered personal decision journal that helps users break negative communication patterns. Log a regret, detect patterns over time, and receive proactive nudges before repeating the same mistake.

---

## How It Works

1. **Log a regret** — describe what happened, what triggered it, your emotional state, and what you wish you'd done instead
2. **AI detects patterns** — the system analyzes entries using sentiment analysis, text embeddings, and cosine similarity to find recurring themes
3. **Get a nudge** — when the system detects you're heading into a familiar pattern, it sends a gentle reminder with your own past reflection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Tailwind CSS |
| Backend | Node.js + Express |
| AI/ML Engine | Python + FastAPI |
| Database | PostgreSQL (via Supabase) or MongoDB Atlas |
| Auth | JWT-based authentication |

---

## Project Structure

```
remind-app/
├── client/                # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page-level components
│       ├── hooks/         # Custom React hooks
│       ├── utils/         # Helper functions
│       ├── styles/        # Global styles / Tailwind config
│       └── App.jsx
├── server/                # Node.js + Express backend
│   ├── routes/            # API route handlers
│   ├── controllers/       # Business logic
│   ├── models/            # Database models / schemas
│   ├── middleware/        # Auth, validation, error handling
│   ├── config/            # DB connection, environment config
│   └── index.js
├── ai-engine/             # Python FastAPI microservice
│   ├── app/
│   │   ├── main.py        # FastAPI app entry point
│   │   ├── sentiment.py   # Sentiment analysis module
│   │   ├── embeddings.py  # Text embedding generation
│   │   ├── patterns.py    # Pattern detection (cosine similarity)
│   │   ├── nudges.py      # Nudge generation logic
│   │   └── insights.py    # Analytics computation
│   ├── tests/             # Unit tests for ML pipeline
│   └── requirements.txt
├── docs/                  # Project documentation
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- npm or yarn
- Git

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/remind-app.git
cd remind-app
```

**2. Frontend setup**
```bash
cd client
npm install
npm run dev
```

**3. Backend setup**
```bash
cd server
npm install
npm run dev
```

**4. AI Engine setup**
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/entries` | List all regret entries |
| POST | `/api/entries` | Create a new entry |
| GET | `/api/entries/:id` | Get single entry with linked patterns |
| GET | `/api/nudges` | List active nudges |
| POST | `/api/nudges` | Create a nudge rule |
| GET | `/api/insights` | Get aggregated analytics |
| POST | `/api/analyze` | Trigger AI analysis on an entry |

---

## Team

| Role | Name |
|------|------|
| Team Lead + AI/ML Co-Developer | Sonakshi |
| AI/ML Engineer | Keya |
| Backend Developer | Rithika |
| UX/Design + Docs | Nivedha |
| Frontend Developer | Hrishikesh |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for branching strategy, PR process, and code standards.

---

## License

This project is part of a semester-long course project at SJSU — Spring 2026.
