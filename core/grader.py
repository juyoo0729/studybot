"""결정적 채점 로직 — LLM을 절대 사용하지 않는다."""
import re


def normalize(text: str) -> str:
    """소문자 변환 후 공백·특수문자 제거 (한글/영문/숫자만 남김)."""
    return re.sub(r"[^0-9a-z가-힣]", "", text.lower())


def grade_multiple_choice(selected_index: int, answer_index: int) -> bool:
    return selected_index == answer_index


def grade_short_answer(user_answer: str, answer: str, accepted_keywords: list[str] | None = None) -> bool:
    """정규화한 사용자 답변에 허용 키워드 중 하나라도 포함되면 정답."""
    user_norm = normalize(user_answer)
    if not user_norm:
        return False
    keywords = [answer, *(accepted_keywords or [])]
    return any(kw_norm and kw_norm in user_norm for kw_norm in (normalize(k) for k in keywords if k))


def grade(question: dict, response) -> bool:
    """문제 dict와 사용자 응답을 받아 정오를 판정."""
    if question["type"] == "multiple_choice":
        return grade_multiple_choice(response, question["answer_index"])
    return grade_short_answer(str(response), question.get("answer", ""), question.get("accepted_keywords"))
