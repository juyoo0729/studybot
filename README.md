# 📚 StudyBot v2

> 학습 모드별로 답변 스타일이 달라지는 AI 학습 도우미
> 로컬 LLM과 클라우드 API를 자유롭게 전환 가능

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Streamlit](https://img.shields.io/badge/Streamlit-1.x-red)
![Ollama](https://img.shields.io/badge/Ollama-Qwen2.5-green)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3-orange)

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
| 언어 | Python 3.12 |
| 웹 UI | Streamlit |
| 로컬 LLM | Ollama (qwen2.5:7b) |
| 클라우드 API | Groq (Llama 3.3 70b) |
| 환경 변수 | python-dotenv |

## 🔑 API 키 발급

| LLM | 발급 사이트 | 무료 |
|---|---|---|
| Groq | [console.groq.com/keys](https://console.groq.com/keys) | ✅ |
| Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | ✅ |
| Ollama | [ollama.com](https://ollama.com) | ✅ (로컬 설치) |

## 📁 프로젝트 구조

```
studybot/
├── app.py              # Streamlit 메인 UI
├── llm_client.py       # LLM 호출 (qwen + Groq)
├── requirements.txt
├── .env.example        # 환경변수 템플릿
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

### 5. 실행

```bash
streamlit run app.py
```

브라우저에서 `http://localhost:8501` 자동 오픈.

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

## 🔧 향후 개선 방향

- [ ] 학습 히스토리 (최근 질문 5개 표시)
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

- [korea-finance-news-tracker](https://github.com/juyoo0729/korea-finance-news-tracker) — 한국 금융 뉴스 자동 수집 도구

---

> ⚠️ 본 도구는 학습 보조 목적으로 제작되었습니다.
> 학습의 책임은 사용자에게 있으며, AI 답변은 항상 비판적으로 검증해주세요.
