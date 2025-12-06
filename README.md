# 유니브 당근 (Univ_Cararot)

전국 대학생들 간 중고거래 플랫폼 개발
React.js (Frontend) + Flask (Python Backend) application

## 적용 기술 (Tech Stack)

- **Frontend**: React.js with Vite
- **Backend**: Flask (Python)
- **Environment**: WSL Ubuntu

## 설치 및 실행 (Setup Instructions)

### 백엔드 설치 및 실행 (Backend Setup)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Backend runs on: http://localhost:5000

### 프론트엔드 설치 및 실행 (Frontend Setup)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## 프로젝트 구조 (Project Structure)

```
project_alpha/
├── frontend/          # React application
├── backend/           # Flask API
└── README.md
```

EOF
