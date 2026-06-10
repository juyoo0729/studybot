"""STEP 1 — 노트 입력."""
import streamlit as st


def render() -> None:
    st.subheader("① 오늘 배운 노트를 붙여넣으세요")
    note = st.text_area(
        "노트 내용 (markdown / plain text)",
        value=st.session_state["note_text"],
        height=300,
        placeholder="예)\n# LangGraph\n- 노드와 엣지로 LLM 워크플로우를 그래프로 구성\n- 상태(State)를 명시적으로 관리...",
    )

    col_back, col_next = st.columns([1, 1])
    if col_back.button("← 대시보드로"):
        st.session_state["step"] = 0
        st.rerun()

    if col_next.button("다음 →", type="primary", disabled=not note.strip()):
        st.session_state["note_text"] = note.strip()
        st.session_state["concepts"] = []  # 노트가 바뀌었을 수 있으니 추출 결과 초기화
        st.session_state["note_id"] = None
        st.session_state["step"] = 2
        st.rerun()
