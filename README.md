# StudyBot

12개 과목, 200개 이상의 학습 주제를 클릭 한 번으로 **AI 학습 도우미**에게 질문할 수 있는 학습 도우미 앱입니다.  
AIFFEL 부트캠프 학습자를 위해 제작되었습니다.

---

## 기능

- **12개 과목** — 기초(Python, 수학, 영어, 알고리즘, 과학) + AI/ML(데이터분석, 딥러닝, CV, DLthon, NLP, LLM, MLOps)
- **세부 커리큘럼** — 수학·영어·과학은 초등 / 중등 / 고등 단계로 분리, 과학은 물리·화학·생명과학·지구과학 선택 가능
- **3단계 난이도** — 초급 / 중급 / 상급 (난이도별 프롬프트 자동 생성)
- **목차 사이드바** — 과목별 번호 목차를 클릭하면 AI가 즉시 설명
- **다음 주제 이동** — 답변 하단의 버튼으로 순서대로 학습
- **자유 채팅(ChatBox)** — 화면 하단에서 언제든 자유롭게 추가 질문 가능
- **자동 재시도** — 서버 과부하(429/503) 시 최대 3회 자동 재시도
- **Wikipedia 요약 카드** — Python 등 주제 선택 시 Wikipedia 핵심 요약 자동 표시 (파일럿)
- **다크 테마** — GitHub 스타일 다크 UI
- **반응형** — 모바일 포함 모든 화면 크기 지원

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | React 18 |
| 빌드 도구 | Vite 5 |
| AI 엔진 | Google Gemini 2.5 Flash |
| API 인증 | Vercel 서버 환경 변수 (`GEMINI_API_KEY`) |
| 스타일 | CSS-in-JS (인라인 스타일) |
| 배포 | Vercel (권장) |

---

## 빠른 시작

### 1. 환경 변수 설정

Gemini API 키를 서버 환경 변수로 설정합니다. 브라우저에는 API 키를 저장하거나 전달하지 않습니다.

```bash
GEMINI_API_KEY=your_gemini_api_key
```

### 2. 로컬 실행

```bash
npm install
npm run dev
# http://localhost:5173 에서 확인
```

AI 요청은 Vercel 서버 함수(`/api/chat`)를 통해 처리됩니다.

---

## 배포 (Vercel — 무료)

### 방법 1 — GitHub 연동 (권장)

```bash
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/<username>/studybot.git
git push -u origin main
```

이후 [vercel.com](https://vercel.com) → New Project → 저장소 선택 → Deploy.

### 방법 2 — Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## 파일 구조

```
studybot/
├── index.html           # 앱 진입점
├── vite.config.js       # Vite 설정
├── package.json         # 패키지 정보
├── api/
│   └── chat.js          # Gemini 서버 함수
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx         # React 진입점
    ├── index.css        # 전역 스타일
    ├── App.jsx          # 메인 앱 (과목 목록, AI 호출, 렌더링)
    └── ChatBox.jsx      # 하단 자유 채팅 컴포넌트
```

---

## 과목 목록

| 그룹 | 과목 | 세부 단계 |
|------|------|-----------|
| 기초 | Python | — |
| 기초 | 수학 | 초등 / 중등 / 고등 |
| 기초 | 영어 | 초등 / 중등 / 고등 |
| 기초 | 알고리즘 | — |
| 기초 | 과학 | 초등 / 중등 / 물리 / 화학 / 생명과학 / 지구과학 |
| AI/ML | 데이터분석 | — |
| AI/ML | 딥러닝 | — |
| AI/ML | CV | — |
| AI/ML | DLthon | — |
| AI/ML | NLP | — |
| AI/ML | LLM | — |
| AI/ML | MLOps | — |
