import ollama

_COMMON = (
    "⚠️ 사용자가 명시적으로 요청하지 않으면 다음을 하지 마세요:\n"
    "- 긴 코드 블록 작성\n"
    "- 자체 추가 설명 늘리기\n"
    "- 사용자가 묻지 않은 내용 다루기\n\n"
)

SYSTEM_PROMPTS = {
    "설명": (
        _COMMON +
        "당신은 친절한 튜터입니다. 사용자의 질문에 대해 핵심 개념을 명확하게 설명하세요.\n\n"
        "규칙:\n"
        "- 비유와 예시로 쉽게 설명\n"
        "- 1-2문단으로 핵심만\n"
        "- 코드는 명시적 요청 시에만 (예: '코드 짜줘')\n"
        "- 단순 계산 질문이면 답만 짧게 (예: '5+3=8')\n"
        "- 질문이 모호하면 사용자에게 의도를 되물어보세요\n"
        "- 문제는 출제하지 마세요"
    ),
    "설명 + 기본 문제": (
        _COMMON +
        "당신은 학습 도우미입니다. 두 가지를 제공하세요:\n\n"
        "1. 개념 설명 (1-2문단, 핵심만)\n"
        "2. 기본 확인 문제 1-2개\n\n"
        "기본 문제 기준:\n"
        "- 방금 설명한 개념을 그대로 적용하면 풀리는 수준\n"
        "- 너무 쉽지도 어렵지도 않게\n"
        "- 정답은 별도로 표시 (예: '정답은 글 마지막에')\n\n"
        "규칙:\n"
        "- 코드는 명시적 요청 시에만\n"
        "- 단순 계산이면 짧게"
    ),
    "심화 문제": (
        _COMMON +
        "당신은 도전 과제 출제자입니다. 사용자가 이미 기본 개념을 안다고 가정하고:\n\n"
        "1. 짧은 핵심 정리 (3-5줄)\n"
        "2. 심화 문제 1-2개 출제\n"
        "   - 응용/조합/예외 케이스 다루는 수준\n"
        "   - 실무에서 만날 만한 상황\n"
        "3. 정답 + 풀이 과정\n\n"
        "규칙:\n"
        "- 처음 배우는 사람이 막히면 '설명' 모드 추천 안내\n"
        "- 코드 문제일 경우 코드로 답변 OK"
    ),
}


def ask_llm(question: str, llm_choice: str, api_key: str = None, mode: str = "개념 설명") -> str:
    system_prompt = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["설명"])
    if llm_choice == "qwen2.5:7b":
        return _ask_qwen(question, system_prompt)
    if llm_choice == "groq":
        return _ask_groq(question, system_prompt, api_key)
    if llm_choice == "gemini":
        return _ask_gemini(question, system_prompt, api_key)
    return f"알 수 없는 모델입니다: {llm_choice}"


def _ask_qwen(question: str, system_prompt: str) -> str:
    try:
        response = ollama.chat(
            model="qwen2.5:7b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
        )
        return response["message"]["content"]
    except Exception as e:
        err = str(e).lower()
        if "connection" in err or "refused" in err:
            return "Ollama가 실행되지 않고 있습니다. 터미널에서 `ollama serve`를 먼저 실행해 주세요."
        return f"Ollama 오류: {e}"


def _ask_groq(question: str, system_prompt: str, api_key: str) -> str:
    if not api_key:
        return "Groq API 키를 입력해 주세요."
    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question},
            ],
        )
        return response.choices[0].message.content
    except ImportError:
        return "groq 패키지가 설치되지 않았습니다. `pip install groq`를 실행해 주세요."
    except Exception as e:
        err = str(e)
        if "401" in err or "invalid_api_key" in err.lower():
            return "Groq API 키가 올바르지 않습니다. 키를 다시 확인해 주세요."
        if "429" in err:
            return "Groq API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
        return f"Groq 오류: {e}"


def _ask_gemini(question: str, system_prompt: str, api_key: str) -> str:
    if not api_key:
        return "Gemini API 키를 입력해 주세요."
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=system_prompt)
        response = model.generate_content(question)
        return response.text
    except ImportError:
        return "google-generativeai 패키지가 설치되지 않았습니다. `pip install google-generativeai`를 실행해 주세요."
    except Exception as e:
        return f"Gemini 오류: {e}"
