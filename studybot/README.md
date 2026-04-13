# 📚 StudyBot — AIFFEL 학습 도우미

12개 과목, 200개 이상의 학습 주제를 클릭 한 번으로 Claude에게 질문할 수 있는 학습 도우미 앱입니다.

---

## 🚀 Vercel 배포 방법 (완전 무료)

### 방법 1 — GitHub 연동 (추천)

1. **GitHub에 올리기**
   ```bash
   # 이 폴더를 GitHub 저장소로 만들기
   cd studybot
   git init
   git add .
   git commit -m "StudyBot 첫 배포"
   git remote add origin https://github.com/juyoo0729/studybot.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - [vercel.com](https://vercel.com) 접속 → GitHub 로그인
   - "New Project" → studybot 저장소 선택
   - 설정 없이 "Deploy" 클릭
   - 🎉 완료! `https://studybot-xxx.vercel.app` 주소 생성

### 방법 2 — Vercel CLI

```bash
npm install -g vercel
cd studybot
vercel
# 안내에 따라 진행하면 자동 배포!
```

---

## 💻 로컬 실행 방법

```bash
cd studybot
npm install
npm run dev
# http://localhost:5173 에서 확인
```

---

## 📁 파일 구조

```
studybot/
├── index.html          # 앱 진입점
├── vite.config.js      # Vite 설정
├── package.json        # 패키지 정보
├── public/
│   └── favicon.svg     # 파비콘
└── src/
    ├── main.jsx        # React 진입점
    ├── index.css       # 전역 스타일
    └── App.jsx         # 메인 앱 컴포넌트
```

---

## ✨ 기능

- 📚 12개 과목 (Python, 수학, 영어, 알고리즘, 과학, 데이터분석, 딥러닝, CV, DLthon, NLP, LLM, MLOps)
- 🎯 3단계 난이도 (초급/중급/상급)
- ⚡ 원클릭 질문 자동 생성 & 클립보드 복사
- 🌐 홈페이지 + 앱 구조
- 📱 반응형 디자인
