# Project Alpha

React.js (Frontend) + Flask (Python Backend) application

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Flask (Python)
- **Environment**: WSL Ubuntu

## Setup Instructions

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Project Structure

```
project_alpha/
├── frontend/          # React application
├── backend/           # Flask API
└── README.md
```

EOF
