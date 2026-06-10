"""STEP 3 — 퀴즈 생성 (LLM 호출 #2) / STEP 4 — 풀기 + 결정적 채점 + SM-2 갱신.

채점과 스케줄링에는 LLM을 사용하지 않는다.
"""
from datetime import date

import streamlit as st

from core import grader, llm, sm2, storage


def _generate() -> bool:
    api_key = st.session_state.get("api_key", "")
    if not api_key:
        st.warning("사이드바에 Gemini API 키를 입력해 주세요.")
        return False

    selected = st.session_state["selected_concepts"]
    with st.spinner("퀴즈 생성 중..."):
        try:
            raw_questions = llm.generate_quiz(api_key, selected)
        except llm.LLMError as e:
            st.error(f"퀴즈 생성에 실패했습니다: {e}")
            return False

    today = date.today()
    tag_by_name = {c["name"]: c["tag"] for c in selected}
    questions = storage.load(storage.QUESTIONS)
    records = []
    for q in raw_questions:
        record = {
            "id": storage.new_id("q", questions, today),
            "note_id": st.session_state["note_id"],
            "type": q["type"],
            "question": q["question"],
            "concept": q.get("concept", ""),
            "tag": tag_by_name.get(q.get("concept", ""), "기타"),
            "explanation": q.get("explanation", ""),
            "sm2": sm2.new_state(today),
            "history": [],
        }
        if q["type"] == "multiple_choice":
            record["choices"] = q["choices"]
            record["answer_index"] = q["answer_index"]
        else:
            record["answer"] = q["answer"]
            record["accepted_keywords"] = q.get("accepted_keywords", [])
        questions.append(record)
        records.append(record)
    storage.save(storage.QUESTIONS, questions)

    st.session_state["quiz_queue"] = records
    st.session_state["quiz_pos"] = 0
    st.session_state["answered"] = False
    st.session_state["session_results"] = []
    return True


def _correct_answer_text(question: dict) -> str:
    if question["type"] == "multiple_choice":
        return question["choices"][question["answer_index"]]
    return question["answer"]


def _submit(question: dict, response) -> None:
    today = date.today()
    correct = grader.grade(question, response)
    quality = sm2.quality_from_result(question["type"], correct)
    question["sm2"] = sm2.update(question["sm2"], quality, today)
    question.setdefault("history", []).append({"date": today.isoformat(), "correct": correct})
    storage.upsert_question(question)

    st.session_state["session_results"].append({
        "id": question["id"],
        "question": question["question"],
        "concept": question.get("concept", ""),
        "correct": correct,
        "correct_answer": _correct_answer_text(question),
        "explanation": question.get("explanation", ""),
        "next_review": question["sm2"]["next_review"],
    })
    st.session_state["answered"] = True
    st.session_state["last_correct"] = correct


def _render_question() -> None:
    queue = st.session_state["quiz_queue"]
    pos = st.session_state["quiz_pos"]
    question = queue[pos]

    mode = "복습" if st.session_state["review_mode"] else "퀴즈"
    st.subheader(f"④ {mode} — {pos + 1} / {len(queue)}")
    st.progress((pos + 1) / len(queue))
    st.markdown(f"#### {question['question']}")

    if not st.session_state["answered"]:
        if question["type"] == "multiple_choice":
            choice = st.radio(
                "보기를 선택하세요",
                question["choices"],
                index=None,
                key=f"resp_{question['id']}_{pos}",
            )
            response = question["choices"].index(choice) if choice is not None else None
            ready = response is not None
        else:
            text = st.text_input("답을 입력하세요", key=f"resp_{question['id']}_{pos}")
            response = text
            ready = bool(text.strip())

        if st.button("제출", type="primary", disabled=not ready):
            _submit(question, response)
            st.rerun()
        return

    # 채점 결과 표시
    if st.session_state["last_correct"]:
        st.success("✅ 정답입니다!")
    else:
        st.error(f"❌ 오답입니다. 정답: **{_correct_answer_text(question)}**")
    if question.get("explanation"):
        st.info(f"💡 {question['explanation']}")
    st.caption(f"다음 복습일: {question['sm2']['next_review']}")

    is_last = pos + 1 >= len(queue)
    label = "결과 보기 →" if is_last else "다음 문제 →"
    if st.button(label, type="primary"):
        if is_last:
            st.session_state["step"] = 5
        else:
            st.session_state["quiz_pos"] = pos + 1
            st.session_state["answered"] = False
        st.rerun()


def render() -> None:
    if st.session_state["step"] == 3:
        st.subheader("③ 퀴즈 생성")
        if _generate():
            st.session_state["step"] = 4
            st.rerun()
        if st.button("← 개념 선택으로 돌아가기"):
            st.session_state["step"] = 2
            st.rerun()
        return

    if not st.session_state["quiz_queue"]:
        st.info("풀 문제가 없습니다.")
        if st.button("← 대시보드로"):
            st.session_state["step"] = 0
            st.rerun()
        return

    _render_question()
