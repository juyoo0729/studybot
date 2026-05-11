import os
import re
import streamlit as st
from dotenv import load_dotenv
from llm_client import ask_all, build_prompt

load_dotenv()

MODES = {
    "explain":      "📖 설명",
    "explain_quiz": "📝 설명 + 기본문제",
    "advanced":     "🔥 심화문제",
}

OLLAMA_MODELS = {
    "qwen2.5:7b":      "🌏 Qwen 2.5 (다국어·추론 강함, 7B)",
    "exaone3.5:2.4b":  "🇰🇷 EXAONE 3.5 (한국어 특화, 2.4B)",
    "gemma2:9b":       "💎 Gemma 2 (Google, 균형형, 9B)",
    "llama3.2:3b":     "🦙 Llama 3.2 (Meta, 경량 빠름, 3B)",
}


def save_gemini_key_to_env(key: str) -> None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    try:
        lines = open(env_path, encoding="utf-8").readlines() if os.path.exists(env_path) else []
    except Exception:
        lines = []

    updated = False
    new_lines = []
    for line in lines:
        if re.match(r"^\s*GEMINI_API_KEY\s*=", line):
            new_lines.append(f"GEMINI_API_KEY={key}\n")
            updated = True
        else:
            new_lines.append(line)
    if not updated:
        new_lines.append(f"GEMINI_API_KEY={key}\n")

    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)


# ── 페이지 설정 ─────────────────────────────────────────────────────────────

st.set_page_config(page_title="StudyBot v2", page_icon="📚", layout="wide")
st.title("📚 StudyBot v2")
st.caption("자유롭게 질문하면 선택한 LLM이 동시에 답변합니다.")

# ── 사이드바 ─────────────────────────────────────────────────────────────────

with st.sidebar:
    st.header("⚙️ 설정")

    # 학습 모드
    st.subheader("학습 모드")
    mode = st.radio("모드 선택", list(MODES.keys()), format_func=lambda k: MODES[k])

    st.divider()

    # LLM 선택
    st.subheader("LLM 선택")

    use_ollama = st.checkbox("Ollama (로컬)", value=True)
    ollama_cfg = {}
    if use_ollama:
        ollama_cfg["base_url"] = st.text_input("Ollama URL", value="http://localhost:11434")
        ollama_cfg["model"] = st.selectbox(
            "Ollama 모델",
            list(OLLAMA_MODELS.keys()),
            format_func=lambda k: OLLAMA_MODELS[k],
        )

    st.divider()

    use_groq = st.checkbox("Groq · Llama 3.3 70b")
    groq_key = ""
    if use_groq:
        groq_key = st.text_input("Groq API Key", type="password", placeholder="gsk_...")

    st.divider()

    use_gemini = st.checkbox("Gemini 2.5 Flash")
    gemini_key = ""
    if use_gemini:
        gemini_key = st.text_input(
            "Gemini API Key",
            value=os.getenv("GEMINI_API_KEY", ""),
            type="password",
            placeholder="AIza...",
        )
        if st.button("💾 .env에 저장"):
            if gemini_key:
                save_gemini_key_to_env(gemini_key)
                st.success("저장 완료 — 다음 실행부터 자동 로드됩니다.")
            else:
                st.warning("키를 입력하세요.")

# ── 메인 ─────────────────────────────────────────────────────────────────────

question = st.text_area(
    "질문을 자유롭게 입력하세요",
    placeholder="예: 재귀함수가 뭐야? / 편미분 개념 설명해줘 / 트랜스포머 attention 원리",
    height=120,
)

# 활성 LLM 목록 구성
targets = []
if use_ollama:
    targets.append({"provider": "ollama", "model": ollama_cfg.get("model", "qwen2.5:7b"), "base_url": ollama_cfg.get("base_url", "http://localhost:11434")})
if use_groq and groq_key:
    targets.append({"provider": "groq", "api_key": groq_key})
if use_gemini and gemini_key:
    targets.append({"provider": "gemini", "api_key": gemini_key})

# 버튼 비활성 조건
no_llm = len(targets) == 0
no_question = not question.strip()
run = st.button(
    "▶ 질문하기",
    disabled=no_llm or no_question,
    type="primary",
    help="LLM을 하나 이상 선택하고 질문을 입력하세요." if (no_llm or no_question) else None,
)

if no_llm:
    st.info("사이드바에서 LLM을 하나 이상 선택하세요.")

# ── 실행 ─────────────────────────────────────────────────────────────────────

if run and targets and question.strip():
    prompt = build_prompt(mode, question.strip())
    cache_key = f"{mode}__{question.strip()}__{[t['provider'] for t in targets]}"

    if cache_key not in st.session_state:
        # 상태 표시
        status_cols = st.columns(len(targets))
        placeholders = [col.empty() for col in status_cols]
        for i, t in enumerate(targets):
            label = f"Ollama · {t.get('model','')}" if t["provider"] == "ollama" else \
                    "Groq · Llama 3.3 70b" if t["provider"] == "groq" else "Gemini · 2.5 Flash"
            placeholders[i].info(f"⏳ {label} 응답 중...")

        with st.spinner(f"{len(targets)}개 LLM 동시 응답 중..."):
            results = ask_all(targets, prompt)

        st.session_state[cache_key] = results

        for i, r in enumerate(results):
            if r["error"]:
                placeholders[i].error(f"❌ {r['model']}\n{r['error']}")
            else:
                placeholders[i].success(f"✅ {r['model']} · {r['elapsed']}s")

    results = st.session_state[cache_key]

    st.divider()
    st.subheader(f"{MODES[mode]} 결과 — {len(results)}개 LLM 비교")

    cols = st.columns(len(results))
    for col, r in zip(cols, results):
        with col:
            st.markdown(f"#### {r['model']}")
            if r["error"]:
                st.error(f"오류: {r['error']}")
            else:
                st.caption(f"응답 시간: **{r['elapsed']}s**")
                st.markdown(r["response"])
