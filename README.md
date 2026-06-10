# 📚 StudyBot v2

> 학습 모드별로 답변 스타일이 달라지는 AI 학습 도우미
> 로컬 LLM과 클라우드 API를 자유롭게 전환 가능

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-1.x-red)
![Ollama](https://img.shields.io/badge/Ollama-Qwen2.5-green)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3-orange)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-blueviolet)

## 🎯 프로젝트 소개

부트캠프 학습 중 만든 개인 프로젝트입니다. 단순한 LLM 채팅이 아니라 **학습 단계에 따라 답변 스타일이 달라지는** 도우미를 목표로 만들었습니다.

기존 ChatGPT나 Gemini 채팅과의 차별점:
- 학습 단계(설명/기본문제/심화문제)에 따른 답변 스타일 분리
- 로컬 LLM(무료)과 클라우드 API(BYOK) 자유 선택
- 한국어 학습자 맞춤 프롬프트 가이드

## ✨ 주요 기능

### 1. 학습 모드 (3단계)

학습 단계에 맞는 답변을 받을 수 있습니다:

- **설명** — 개념을 친절하고 자세하게
- **설명 + 기본 문제** — 개념 설명 + 이해도 확인 문제
- **심화 문제** — 응용 문제와 도전 과제

### 2. LLM 선택 (하이브리드)

Ollama (로컬) + Groq + Gemini — 동시 비교 (병렬 호출):

- **Ollama (로컬)** — qwen2.5:7b / exaone3.5:2.4b / gemma2:9b / llama3.2:3b 중 선택, API 키 불필요
- **Groq Llama 3.3 70b (API)** — 빠른 응답, 더 똑똑한 답변
- **Gemini 2.5 Flash (API)** — Google 최신 모델

세 LLM을 ThreadPoolExecutor로 동시 호출해 결과를 비교하고 응답 시간을 확인할 수 있습니다.

### 3. BYOK (Bring Your Own Key)

Groq API 키를 사용자가 직접 발급받아 입력합니다:

- 키는 세션 메모리에만 저장 (안전)
- 도구 코드에 키 하드코딩 없음
- 키 발급 안내 + 직접 링크 제공

### 4. 프롬프트 작성 가이드

학습 모드별로 어떤 질문이 적합한지 예시 표시:

- 빈 입력창 앞에서 막히지 않게 안내
- 모드 변경 시 가이드도 자동 변경

## 🛠️ 기술 스택

| 분류 | 기술 |
|---|---|
| 언어 | Python 3.11+ |
| 웹 UI | Streamlit |
| 로컬 LLM | Ollama (qwen2.5:7b) |
| 클라우드 API | Groq (Llama 3.3 70b), Gemini (2.5 Flash) |
| 환경 변수 | python-dotenv |

## 🔑 API 키 발급

| LLM | 발급 사이트 | 무료 |
|---|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | ✅ |
| Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | ✅ |
| Ollama | [ollama.com](https://ollama.com) | ✅ (로컬 설치) |

## 📁 프로젝트 구조

```
studybot-v2/
├── app.py              # Streamlit 메인 UI
├── llm_client.py       # LLM 호출 (Ollama + Groq + Gemini)
├── .streamlit/
│   └── config.toml     # 서버 설정 (localhost 바인딩, 포트 9999)
├── requirements.txt
├── .env.example        # 환경변수 템플릿 (GEMINI_API_KEY)
├── .gitignore
└── README.md
```

## 🚀 시작하기

### 1. 저장소 복제

```bash
git clone https://github.com/juyoo0729/studybot-v2.git
cd studybot-v2
```

### 2. Python 패키지 설치

```bash
pip install -r requirements.txt
```

### 3. 로컬 LLM 설정 (Ollama)

[Ollama 설치](https://ollama.com/download/windows) 후:

```bash
ollama pull qwen2.5:7b
```

### 4. (선택) Groq API 키 발급

더 빠르고 똑똑한 답변을 원하시면 무료 API 키를 발급받으세요:

1. [console.groq.com/keys](https://console.groq.com/keys) 접속
2. Google 또는 GitHub 계정으로 로그인
3. **"Create API Key"** 클릭
4. 발급된 키(gsk_...)를 안전한 곳에 저장

⚠️ **주의:** 발급된 키는 한 번만 표시됩니다. 즉시 저장하세요.

결제카드 등록 없이 무료 한도(분당 30개, 일일 14,400개)로 사용 가능합니다.

### 5. (선택) Gemini API 키 설정

[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)에서 키를 발급받은 뒤,
앱 사이드바에 직접 입력하거나 환경변수로 설정할 수 있습니다:

```bash
copy .env.example .env    # 후 GEMINI_API_KEY 값 입력
```

환경변수 키는 `AIza` 형식일 때만 입력창에 자동 채워집니다 (잘못된 값 유입 방지).

### 6. 실행

```bash
streamlit run app.py
```

브라우저에서 `http://localhost:9999` 자동 오픈 (`.streamlit/config.toml`에서 포트 지정).

## 💡 사용 방법

### 기본 사용 (로컬 LLM)

1. 사이드바에서 **qwen2.5:7b** 선택 (기본)
2. 학습 모드 선택 (설명 / 설명+기본 / 심화)
3. 질문 입력 → "질문하기" 클릭

### Groq API 사용 (더 빠르고 똑똑함)

1. 사이드바에서 **Groq Llama 3.3 70b** 선택
2. 발급받은 API 키 입력
3. 학습 모드 선택
4. 질문 입력

### 학습 모드 활용 예시

같은 주제 "VGG-16"으로 모드별 답변 스타일 비교:

- **설명**: 개념과 구조를 비유로 자세히
- **설명 + 기본 문제**: 개념 설명 + "VGG-16의 레이어 수는?" 같은 확인 문제
- **심화 문제**: "VGG-16과 ResNet의 차이를 설명하고 어떤 상황에서 어느 것을 선택?"

## 🔒 보안

- API 키는 세션 메모리에만 저장 (페이지 새로고침 시 사라짐)
- `.env` 파일은 `.gitignore`로 제외
- 코드 어디에도 키 하드코딩 없음
- 사용자 자신의 키만 사용 (BYOK 패턴)
- 서버는 `localhost`에만 바인딩 (`.streamlit/config.toml`) — 외부 네트워크 노출 방지
- 환경변수 Gemini 키는 `AIza` 형식 검증 후에만 자동 입력

## 🔄 코드 개선 이력

Claude Code + Codex Plugin 크로스 리뷰 워크플로우로 완료한 개선 작업입니다.

### 보안 수정 4건
- Gemini API 키를 URL 쿼리 파라미터 → `x-goog-api-key` 헤더로 이동 (로그 노출 방지)
- Gemini endpoint `/v1/` → `/v1beta/` 수정
- UI의 `.env` 저장 버튼 제거 (세션 메모리 only 원칙 일관화)
- Gemini 빈 `candidates` 응답 시 IndexError → 에러 딕셔너리로 방어

### 코드 품질 4건
- `ask_ollama` 재시도 로직 추가 (Groq/Gemini와 동일 패턴으로 일관화)
- 미사용 `groq` 패키지 `requirements.txt`에서 제거
- 캐시 키 안정화 (`list` str 표현 → `|` 구분 join)
- 미사용 `attempt` 변수 제거

### UX 개선
- Groq/Gemini API 키 발급 사이트 링크를 사이드바에 추가 (새 탭 열기)

### Codex Plugin 크로스 리뷰
- `ask_ollama` 재시도 리팩토링 후 파싱 오류 미처리 회귀 버그(P2) 발견 → 즉시 수정

### 2차 개선 (2026.06)
- Groq 응답 파싱 방어 추가 — 빈 `choices`/본문, 파싱 예외를 에러 딕셔너리로 처리 (Gemini와 동일 패턴)
- HTTP 403/503 에러에 사용자 친화적 안내 메시지 추가 (Groq/Gemini 공통)
- 환경변수 Gemini 키가 `AIza` 형식일 때만 입력창 자동 채움 (placeholder 등 잘못된 값 유입 방지)
- 캐시 키에 Ollama 모델명 포함 — 모델 변경 시 이전 모델 응답이 재사용되던 문제 해결
- `ask_all` 빈 타깃 가드 추가
- `ask_ollama` 타임아웃 처리를 재시도 루프와 일관되게 통합
- `.streamlit/config.toml` 추가 — localhost 바인딩, 포트 9999 고정
- `.env.example` 템플릿에 `GEMINI_API_KEY` 추가

## 💡 개발 과정에서 배운 점

이 프로젝트의 진짜 가치는 도구 자체보다 **만들면서 부딪힌 문제들을 풀어가는 과정**에 있었습니다.

### 작은 LLM의 한계 인식

- exaone3.5:2.4b로 처음 시도 → 한국어 학습 설명 품질 부족
- qwen2.5:7b로 전환 → RTX 3070에서 충분히 동작, 답변 품질 향상
- 모델 크기와 환경의 trade-off를 직접 확인

### Gemini API의 지역 제한

- 처음에 Gemini API를 계획했으나 한국 지역에서 무료 한도 0으로 막힘
- Groq API로 전환 → 더 큰 무료 한도, 더 빠른 응답
- API 의존성을 설계할 때 지역/정책 리스크 고려 필요

### 사용자 의도와 LLM 응답의 불일치

- "덧셈문제" 같은 짧은 질문에 LLM이 긴 코드를 자동 생성
- 시스템 프롬프트에 "명시적 요청 없으면 코드 작성 금지" 규칙 추가
- LLM은 맥락 추측을 잘하지만 사용자 의도를 정확히 모름 → 명시적 가이드 필요

### UX의 중요성

- 사이드바에 LLM 설정만 있으면 "이 도구가 무엇을 하는지" 모름
- 학습 모드를 통해 도구의 정체성을 명확히 표현
- 빈 입력창 앞에서 막히지 않도록 모드별 프롬프트 가이드 제공

### BYOK 패턴 적용

- API 키 보안을 위해 사용자가 직접 키 입력하는 구조 채택
- 키는 세션 메모리에만, 코드에 하드코딩 없음
- 키 발급 안내 + 분실 방지 경고로 사용자 친화적 UX

### Cross-review 워크플로우의 가치

- Claude Code로 구현 후 Codex Plugin으로 독립 리뷰
- 재시도 로직 추가 중 파싱 오류 미처리 회귀 버그(P2) 발견
- 구현과 리뷰를 분리하면 놓치기 쉬운 엣지 케이스를 잡을 수 있음

### API 보안 표준 패턴

- API 키를 URL 쿼리 파라미터에 넣으면 서버 로그·프록시에 노출됨을 직접 확인
- Gemini `?key=` → `x-goog-api-key` 헤더로 전환
- 키가 어디로 전달되는지 의식적으로 확인하는 습관 필요

## 🚀 다음 버전: StudyBot v3

자유 질문 채팅의 한계(질문을 떠올리는 부담, 일회성 학습)를 넘기 위해
**고정 워크플로우형 학습 앱**으로 방향을 바꾼 후속 버전을 개발했습니다.

- 노트 붙여넣기 → 개념 추출 → 퀴즈 5문제 생성 → 풀기/채점 → 복습 스케줄링의 5단계 고정 파이프라인
- LLM(Gemini) 호출은 개념 추출·퀴즈 생성 2곳뿐, 채점·스케줄링은 결정적 로직
- SM-2 간격 반복 알고리즘 직접 구현으로 복습 일정 자동 관리 (pytest 검증)
- 저장소는 로컬 JSON — 앱을 껐다 켜도 복습 스케줄 유지

→ 로컬 폴더: `../studybot-v3`

## 🔧 향후 개선 방향

- [x] 학습 히스토리 → v3에서 세션 기록(`sessions.json`)으로 구현
- [x] 일회성 답변의 한계 → v3에서 SM-2 기반 복습 스케줄링으로 해결
- [ ] 답변 북마크 기능
- [ ] 마크다운/코드 하이라이팅 개선
- [ ] 다른 무료 LLM 옵션 추가 (Together AI, OpenRouter 등)
- [ ] 답변 형식 옵션 (텍스트만 / 코드만 / 표 등)

## 📄 라이선스

개인 학습/포트폴리오 용도로 제작됨

## 🙋 만든 사람

[@juyoo0729](https://github.com/juyoo0729)

AIFFEL AI/ML 부트캠프 교육생 (2026.03.11 ~ 2026.09.10)
ML/Data Science 분야 전환 준비 중

## 🔗 관련 프로젝트

- **StudyBot v3** — 본 프로젝트의 후속 버전, 워크플로우형 학습 앱 (위 "다음 버전" 참고)
- [korea-finance-news-tracker](https://github.com/juyoo0729/korea-finance-news-tracker) — 한국 금융 뉴스 자동 수집 도구

---

> ⚠️ 본 도구는 학습 보조 목적으로 제작되었습니다.
> 학습의 책임은 사용자에게 있으며, AI 답변은 항상 비판적으로 검증해주세요.
