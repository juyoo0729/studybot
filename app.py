import os
import streamlit as st
from llm_client import ask_llm

st.set_page_config(page_title="StudyBot v2", page_icon="📚")
st.title("📚 StudyBot v2")

MODES = {
    "설명": "개념을 자세히",
    "설명 + 기본 문제": "이해도 확인",
    "심화 문제": "도전적인 응용",
}


def _validate_gemini_key(key: str) -> str:
    if not key:
        return "empty"
    if key.startswith("AIzaSy") and len(key) == 39:
        return "ok"
    return "invalid"


def _validate_groq_key(key: str) -> str:
    if not key:
        return "empty"
    if key.startswith("gsk_"):
        return "ok"
    return "invalid"


def _save_key_to_env(env_key: str, value: str):
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    lines = []
    if os.path.exists(env_path):
        with open(env_path, encoding="utf-8") as f:
            lines = [l for l in f.readlines() if not l.startswith(f"{env_key}=")]
    lines.append(f"{env_key}={value}\n")
    with open(env_path, "w", encoding="utf-8") as f:
        f.writelines(lines)


# ── Sidebar ──────────────────────────────────────────────
with st.sidebar:

    # 1. 학습 모드
    st.header("📚 학습 모드")
    mode = st.radio(
        "모드 선택",
        list(MODES.keys()),
        captions=list(MODES.values()),
        label_visibility="collapsed",
    )

    st.divider()

    # 2. LLM 설정
    st.header("⚙️ LLM 설정")
    llm_choice = st.radio(
        "LLM 선택",
        ["qwen2.5:7b", "Groq Llama 3.3 70b"],
        captions=["로컬, 무료, 추천", "API 키 필요, 빠름"],
    )

    api_key = None

    if llm_choice == "Groq Llama 3.3 70b":
        st.markdown(
            '**🔑 <a href="https://console.groq.com/keys" target="_blank">'
            "Groq API 키 발급받기</a>**",
            unsafe_allow_html=True,
        )
        api_key = st.text_input(
            "Groq API 키",
            type="password",
            placeholder="gsk_로 시작하는 키",
        )
        key_status = _validate_groq_key(api_key)
        if key_status == "ok":
            st.success("✅ 키 형식이 올바릅니다.")
        elif key_status == "invalid":
            st.warning("⚠️ 키 형식을 확인해 주세요. (gsk_로 시작)")

        with st.expander("📋 Groq API 키 발급 방법"):
            st.error(
                "⚠️ 중요: 발급된 키는 한 번만 표시됩니다!\n\n"
                "- 발급 직후 반드시 안전한 곳에 저장하세요\n"
                "- 메모장, 비밀번호 관리 앱 등에 보관 권장\n"
                "- 페이지 닫으면 키를 다시 볼 수 없습니다\n"
                "- 잃어버리면 키를 새로 발급받아야 합니다 (기존 키는 못 찾음)"
            )
            st.markdown(
                """
1. [console.groq.com/keys](https://console.groq.com/keys) 클릭
2. Google 또는 GitHub 계정으로 로그인
3. **"Create API Key"** 클릭
4. 발급된 키(gsk_...) 복사 → 위 입력칸에 붙여넣기

> 결제카드 등록 없이 무료로 사용 가능
                """
            )

    elif llm_choice == "Gemini":
        st.markdown(
            '<a href="https://aistudio.google.com/app/apikey" target="_blank">'
            "🔑 Google AI Studio에서 무료로 발급받기</a>",
            unsafe_allow_html=True,
        )
        api_key = st.text_input(
            "Gemini API 키",
            type="password",
            placeholder="AIzaSy로 시작하는 키를 붙여넣으세요",
        )
        key_status = _validate_gemini_key(api_key)
        if key_status == "ok":
            st.success("✅ 키 형식이 올바릅니다.")
        elif key_status == "invalid":
            st.warning("⚠️ 키 형식을 확인해 주세요. (AIzaSy로 시작, 39자)")

        save_to_env = st.checkbox("키 저장 (.env)", value=False, help="프로젝트 폴더의 .env 파일에 저장됩니다.")
        if save_to_env and key_status == "ok":
            _save_key_to_env("GEMINI_API_KEY", api_key)
            st.caption("💾 .env에 저장됨")

        with st.expander("📋 Gemini API 키 발급 방법"):
            st.markdown(
                """
1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. **"Create API key"** 클릭
4. 프로젝트 선택 또는 새 프로젝트 생성
5. 생성된 키(AIzaSy...) 복사 → 위 입력칸에 붙여넣기

> 무료 티어: 분당 15회, 일 1,500회 요청 가능
                """
            )

MODE_GUIDES = {
    "설명": (
        "**개념을 이해하고 싶을 때:**\n"
        "- \"VGG-16이 뭐야?\"\n"
        "- \"어텐션 메커니즘 원리 설명해줘\"\n"
        "- \"Python 데코레이터 개념\"\n\n"
        "💡 단순 계산은 짧게 답해드려요 (예: \"5+3\")"
    ),
    "설명 + 기본 문제": (
        "**개념을 배우고 확인 문제까지 원할 때:**\n"
        "- \"선형회귀 설명하고 문제 내줘\"\n"
        "- \"Pandas groupby 알려주고 연습 문제\"\n"
        "- \"이진 탐색 개념과 기본 문제\"\n\n"
        "💡 이해도 확인용 쉬운 문제 1-2개가 같이 나와요"
    ),
    "심화 문제": (
        "**이미 아는 개념의 응용 문제를 원할 때:**\n"
        "- \"어텐션 메커니즘 응용 문제\"\n"
        "- \"Pandas pivot 심화 문제\"\n"
        "- \"재귀 함수 어려운 예제\"\n\n"
        "⚠️ 처음 배우는 개념이면 **설명** 모드를 먼저 써주세요"
    ),
}

# ── Main ─────────────────────────────────────────────────
st.info(f"🎯 현재 모드: **{mode}** — {MODES[mode]}")

with st.expander("💡 이렇게 물어보세요", expanded=True):
    st.markdown(MODE_GUIDES[mode])

question = st.text_area("질문을 입력하세요", height=120, placeholder="무엇이든 물어보세요...")

if st.button("질문하기", type="primary"):
    if not question.strip():
        st.warning("질문을 입력해 주세요.")
    elif llm_choice == "Groq Llama 3.3 70b" and not api_key:
        st.error("Groq API 키를 사이드바에 입력해 주세요.")
    else:
        llm_key = "groq" if llm_choice == "Groq Llama 3.3 70b" else llm_choice
        with st.spinner(f"[{mode}] 답변 생성 중..."):
            answer = ask_llm(question, llm_choice=llm_key, api_key=api_key, mode=mode)
        st.subheader("답변")
        st.write(answer)
