# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

Project Alpha는 React 프론트엔드와 Flask 백엔드로 구성된 풀스택 웹 애플리케이션으로, 기본적인 클라이언트-서버 통신 패턴을 시연하기 위해 설계되었습니다.

**기술 스택:**
- **프론트엔드**: React 19.2 with Vite, Axios (API 호출)
- **백엔드**: Flask 3.1 with Flask-CORS
- **환경**: WSL Ubuntu, Python 3.12

## 개발 환경 설정

### 백엔드 설정
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

백엔드 실행 주소: `http://localhost:5000`

### 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```

프론트엔드 실행 주소: `http://localhost:5173`

### 두 서비스 동시 실행
애플리케이션이 정상 작동하려면 프론트엔드와 백엔드가 동시에 실행되어야 합니다. 별도의 터미널 세션에서 각각 실행하세요.

## 개발 명령어

### 백엔드 (Flask)
- **개발 서버 실행**: `python app.py` (`/backend`에서 venv 활성화 후 실행)
- **의존성 설치**: `pip install -r requirements.txt`
- **의존성 업데이트**: 새 패키지 추가 후 `pip freeze > requirements.txt`로 업데이트

### 프론트엔드 (React + Vite)
- **개발 서버 실행**: `npm run dev` (`/frontend`에서 실행)
- **프로덕션 빌드**: `npm run build`
- **프로덕션 빌드 미리보기**: `npm run preview`
- **코드 린트**: `npm run lint`
- **의존성 설치**: `npm install`

## 아키텍처

### 백엔드 구조 (`backend/`)
- **`app.py`**: 모든 라우트 정의를 포함한 메인 Flask 애플리케이션 파일
  - Flask-CORS를 사용하여 React 프론트엔드의 크로스 오리진 요청 허용
  - `python-dotenv`를 통해 환경 변수 로드
  - 모든 라우트는 `jsonify()`를 사용하여 JSON 응답 반환

**현재 API 엔드포인트:**
- `GET /`: 환영 메시지
- `GET /api/health`: 헬스 체크 엔드포인트
- `GET /api/test`: 샘플 데이터가 포함된 테스트 엔드포인트
- `POST /api/echo`: 전송된 데이터를 반환하는 에코 엔드포인트

**참고**: `app.py:31`에 버그가 있습니다 - `echo()` 함수가 `request.get_json()`을 사용하지만 Flask에서 `request`를 import하지 않았습니다.

### 프론트엔드 구조 (`frontend/src/`)
- **`main.jsx`**: React 애플리케이션 진입점
- **`App.jsx`**: API 통합 데모가 포함된 메인 애플리케이션 컴포넌트
- **`services/api.js`**: Axios를 사용한 중앙화된 API 클라이언트
  - Base URL: `http://localhost:5000`
  - 내보내는 함수들: `getHealth()`, `getTest()`, `postEcho(data)`

### 통신 흐름
1. 프론트엔드는 `services/api.js`를 통해 Axios를 사용하여 HTTP 요청 수행
2. API 클라이언트가 `localhost:5000`의 Flask 백엔드로 요청 전송
3. Flask 라우트가 요청을 처리하고 JSON 응답 반환
4. 백엔드에 CORS가 설정되어 React 개발 서버의 요청을 수락

### 주요 파일
- `backend/app.py`: 모든 Flask 라우트와 백엔드 로직
- `frontend/src/services/api.js`: API 클라이언트 설정 및 엔드포인트 함수
- `frontend/src/main.jsx`: 백엔드 통합이 완전히 구현된 현재 버전 (api 서비스 사용)
- `frontend/src/App.jsx`: 백엔드 통합이 없는 더 간단한 대체 버전
