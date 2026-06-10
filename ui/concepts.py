"""STEP 2 — 핵심 개념 추출 (LLM 호출 #1) 및 개념 선택."""
from datetime import date

import streamlit as st

from core import llm, storage


def _extract() -> bool:
    api_key = st.session_state.get("api_key", "")
    if not api_key:
        st.warning("사이드바에 Gemini API 키를 입력해 주세요.")
        return False

    with st.spinner("개념 추출 중..."):
        try:
            extracted = llm.extract_concepts(api_key, st.session_state["note_text"])
        except llm.LLMError as e:
            st.error(f"개념 추출에 실패했습니다: {e}")
            return False

    today = date.today()
    notes = storage.load(storage.NOTES)
    note_id = storage.new_id("n", notes, today)
    notes.append({
        "id": note_id,
        "date": today.isoformat(),
        "text": st.session_state["note_text"],
        "concepts": extracted,
    })
    storage.save(storage.NOTES, notes)

    st.session_state["concepts"] = extracted
    st.session_state["note_id"] = note_id
    return True


def render() -> None:
    st.subheader("② 추출된 핵심 개념")

    if not st.session_state["concepts"]:
        if not _extract():
            if st.button("← 노트 입력으로 돌아가기"):
                st.session_state["step"] = 1
                st.rerun()
            return

    st.caption("퀴즈에 포함할 개념을 선택하세요.")
    selected = []
    for i, concept in enumerate(st.session_state["concepts"]):
        with st.container(border=True):
            checked = st.checkbox(
                f"**{concept['name']}** · `{concept['tag']}`",
                value=True,
                key=f"concept_{i}",
            )
            st.caption(concept["summary"])
        if checked:
            selected.append(concept)

    col_back, col_next = st.columns([1, 1])
    if col_back.button("← 노트 다시 입력"):
        st.session_state["step"] = 1
        st.rerun()

    if col_next.button("퀴즈 만들기 →", type="primary", disabled=not selected):
        st.session_state["selected_concepts"] = selected
        st.session_state["step"] = 3
        st.rerun()
