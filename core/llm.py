"""Gemini 호출 — 이 모듈의 extract_concepts / generate_quiz 두 함수가
앱 전체에서 유일한 LLM 호출 지점이다."""
import json
import re

import google.generativeai as genai

MODEL_NAME = "gemini-2.0-flash"

_CONCEPT_PROMPT = """당신은 학습 노트에서 핵심 개념을 추출하는 도우미입니다.
아래 노트를 읽고 핵심 개념을 추출해 JSON으로만 출력하세요.

규칙:
- 반드시 아래 스키마의 JSON만 출력. 마크다운 백틱(```) 금지. 설명 문장 금지.
- 개념은 3~8개, 노트에 실제로 등장한 내용만.
- summary는 한 줄 요약, tag는 짧은 분류 태그(예: RAG, 선형대수, Python).

스키마:
{{"concepts": [{{"name": "개념명", "summary": "한 줄 요약", "tag": "분류태그"}}]}}

노트:
{note}
"""

_QUIZ_PROMPT = """당신은 학습 퀴즈 출제자입니다.
아래 개념 목록을 바탕으로 문제 5개를 만들어 JSON으로만 출력하세요.

규칙:
- 반드시 아래 스키마의 JSON만 출력. 마크다운 백틱(```) 금지. 설명 문장 금지.
- 객관식(multiple_choice) 4지선다 3개 + 단답형(short_answer) 2개, 총 5개.
- concept 필드는 아래 개념 목록의 name 중 하나와 정확히 일치해야 함.
- 단답형의 answer는 짧은 정답 키워드, accepted_keywords는 동의어·표기 변형 목록.
- explanation은 정답 근거를 1~2문장으로.

스키마:
{{"questions": [
  {{"type": "multiple_choice", "question": "...", "choices": ["A", "B", "C", "D"],
    "answer_index": 2, "concept": "연결된 개념명", "explanation": "해설"}},
  {{"type": "short_answer", "question": "...", "answer": "정답 키워드",
    "accepted_keywords": ["허용 키워드1", "허용 키워드2"],
    "concept": "연결된 개념명", "explanation": "해설"}}
]}}

개념 목록:
{concepts}
"""


class LLMError(Exception):
    """LLM 호출 또는 응답 파싱 실패."""


def _strip_fences(text: str) -> str:
    text = text.strip()
    match = re.match(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
    return match.group(1) if match else text


def _call_json(api_key: str, prompt: str) -> dict:
    """Gemini 호출 후 JSON 파싱. 파싱 실패 시 1회 재시도."""
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(MODEL_NAME)
    last_error = None
    for _ in range(2):  # 최초 1회 + 재시도 1회
        try:
            response = model.generate_content(
                prompt,
                generation_config={"temperature": 0.4, "response_mime_type": "application/json"},
            )
            return json.loads(_strip_fences(response.text))
        except json.JSONDecodeError as e:
            last_error = f"JSON 파싱 실패: {e}"
        except Exception as e:
            last_error = str(e)
    raise LLMError(last_error or "알 수 없는 오류")


def extract_concepts(api_key: str, note_text: str) -> list[dict]:
    """LLM 호출 #1 — 노트에서 핵심 개념 추출."""
    data = _call_json(api_key, _CONCEPT_PROMPT.format(note=note_text))
    concepts = data.get("concepts")
    if not isinstance(concepts, list) or not concepts:
        raise LLMError("개념 추출 결과가 비어 있습니다.")
    return [
        {"name": str(c.get("name", "")).strip(),
         "summary": str(c.get("summary", "")).strip(),
         "tag": str(c.get("tag", "기타")).strip() or "기타"}
        for c in concepts if str(c.get("name", "")).strip()
    ]


def generate_quiz(api_key: str, concepts: list[dict]) -> list[dict]:
    """LLM 호출 #2 — 선택된 개념으로 문제 5개 생성."""
    concept_lines = "\n".join(f"- {c['name']}: {c['summary']} (태그: {c['tag']})" for c in concepts)
    data = _call_json(api_key, _QUIZ_PROMPT.format(concepts=concept_lines))
    questions = data.get("questions")
    if not isinstance(questions, list) or not questions:
        raise LLMError("문제 생성 결과가 비어 있습니다.")

    valid = []
    for q in questions:
        qtype = q.get("type")
        if qtype == "multiple_choice":
            if isinstance(q.get("choices"), list) and len(q["choices"]) == 4 \
                    and isinstance(q.get("answer_index"), int) and 0 <= q["answer_index"] < 4 \
                    and q.get("question"):
                valid.append(q)
        elif qtype == "short_answer":
            if q.get("question") and q.get("answer"):
                q.setdefault("accepted_keywords", [])
                valid.append(q)
    if not valid:
        raise LLMError("유효한 문제가 없습니다.")
    return valid
