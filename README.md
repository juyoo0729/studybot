# 📘 StudyBot

**고정 워크플로우형 학습 앱** — 채팅이 아니라 정해진 파이프라인을 따라 학습합니다.
노트를 붙여넣으면 LLM이 개념을 추출해 퀴즈를 만들고, 채점과 복습 스케줄링은
LLM 없이 결정적(deterministic) 로직과 SM-2 알고리즘으로 처리합니다.

## 핵심 설계

- 사용자 입력 자유도 최소화: 노트 붙여넣기, 버튼 클릭, 답안 입력만 허용
- LLM 호출은 정확히 2곳: `core/llm.py`의 `extract_concepts()`, `generate_quiz()`
- 채점·스케줄링·통계는 전부 LLM 없는 순수 Python (`core/grader.py`, `core/sm2.py`)
- 저장소는 로컬 JSON 파일 (`data/`) — DB 없음

## 실행법

```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. API 키 설정 (둘 중 하나)
#    a) 환경변수
set GEMINI_API_KEY=AIza...        # Windows cmd
$env:GEMINI_API_KEY="AIza..."     # PowerShell
#    b) 앱 실행 후 사이드바에 직접 입력 (BYOK)

# 3. 실행
streamlit run app.py
```

브라우저에서 `http://localhost:9999` 자동 오픈 (`.streamlit/config.toml`에서 localhost 바인딩·포트 지정).
API 키는 `.env.example`을 복사해 `.env`로 설정해도 됩니다.

## 워크플로우 (5단계 고정 파이프라인)

```
STEP 0  대시보드      오늘 복습할 문제 수 + 누적 통계 (LLM ✕)
   │
   ├─ [새 노트 학습 시작]
   │   STEP 1  노트 입력     노트 붙여넣기 (LLM ✕)
   │   STEP 2  개념 추출     Gemini 호출 #1 → 개념 카드 + 체크박스 선택
   │   STEP 3  퀴즈 생성     Gemini 호출 #2 → 객관식 3 + 단답형 2
   │   STEP 4  풀기/채점     결정적 채점 + 문제별 SM-2 즉시 갱신 (LLM ✕)
   │   STEP 5  결과          점수, 오답 해설, 다음 복습일 안내 (LLM ✕)
   │
   └─ [오늘의 복습 시작]
       next_review ≤ 오늘 인 저장된 문제만 모아 STEP 4부터 진행 (LLM 호출 0회)
```

## 아키텍처

```
studybot/
├── app.py              # Streamlit 진입점, step 라우팅 + 진행바
├── core/
│   ├── llm.py          # Gemini 호출 2개 함수 (앱 유일의 LLM 호출 지점)
│   ├── grader.py       # 결정적 채점 (객관식 인덱스 비교 / 단답형 키워드 매칭)
│   ├── sm2.py          # SM-2 간격 반복 (순수 함수)
│   └── storage.py      # JSON 읽기/쓰기, id 발급, 복습 대상 조회
├── ui/
│   ├── dashboard.py    # STEP 0
│   ├── note_input.py   # STEP 1
│   ├── concepts.py     # STEP 2
│   ├── quiz.py         # STEP 3~4
│   └── result.py       # STEP 5
├── data/               # notes.json / questions.json / sessions.json (gitignore)
└── tests/
    └── test_sm2.py     # SM-2 + 채점 로직 pytest
```

## SM-2 동작

문제마다 `easiness(2.5)`, `interval(일)`, `repetitions`, `next_review`를 저장합니다.

- 채점 결과 → quality 변환: 객관식 정답 5 / 오답 2, 단답형 정답 5 / 오답 1
- quality < 3이면 반복 횟수 리셋, 다음날 재복습
- 연속 정답 시 간격이 1일 → 6일 → `interval × easiness`로 늘어남
- easiness 하한 1.3

## 채점 규칙 (LLM 미사용)

- **객관식**: 선택 인덱스 == `answer_index`
- **단답형**: 답안을 정규화(소문자화, 공백·특수문자 제거)한 뒤
  `answer` + `accepted_keywords` 중 하나라도 포함되면 정답

## 테스트

```bash
python -m pytest tests/ -v
```

SM-2 공식(첫 정답 1일, 둘째 6일, 이후 easiness 배수, 오답 리셋, easiness 하한)과
채점 정규화·키워드 매칭을 검증합니다.

## 🕘 버전 히스토리

폴더를 나누지 않고 하나의 저장소에서 git으로 버전을 관리합니다.

| 버전 | 형태 | 위치 |
|---|---|---|
| **v3 (현재)** | 워크플로우형 학습 앱 — 노트→개념→퀴즈→채점→SM-2 복습 | `master` 최신 |
| v2 | 채팅형 학습 도우미 — 학습 모드 3단계, Ollama/Groq/Gemini 병렬 비교 | git tag [`v2.0`](../../releases/tag/v2.0) |

```bash
git checkout v2.0   # v2 코드 보기
git checkout master # 최신으로 복귀
```

### v2 → v3 전환 이유

- 자유 질문 채팅은 "무엇을 물어볼지" 떠올리는 부담이 크고, 답변이 일회성으로 흘러감
- v3는 입력 자유도를 노트 붙여넣기로 좁히고, SM-2 복습 스케줄링으로 학습이 누적되게 함
- LLM 의존을 생성 단계 2곳으로 한정 → 채점·통계는 테스트 가능한 순수 Python

## 🙋 만든 사람

[@juyoo0729](https://github.com/juyoo0729)

AIFFEL AI/ML 부트캠프 교육생 (2026.03.11 ~ 2026.09.10)
ML/Data Science 분야 전환 준비 중

---

> ⚠️ 본 도구는 학습 보조 목적으로 제작되었습니다.
> 학습의 책임은 사용자에게 있으며, AI 답변은 항상 비판적으로 검증해주세요.
