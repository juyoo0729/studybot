import time
import random
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

PROMPTS = {
    "explain": (
        "당신은 친절한 학습 튜터입니다. 아래 질문에 대해 다음 순서로 설명하세요:\n"
        "1. 핵심 개념 (비유 포함)\n"
        "2. 왜 중요한지\n"
        "3. 실제 예시\n"
        "4. 코드 예시 (해당하는 경우)\n"
        "5. 초보자가 헷갈리는 포인트\n"
        "6. 한 줄 핵심 요약\n\n"
        "핵심 키워드는 **굵게**, 절대 짧게 설명하지 말 것.\n\n"
    ),
    "explain_quiz": (
        "당신은 친절한 학습 튜터입니다. 아래 질문에 대해:\n"
        "1. 핵심 개념 설명 (비유 포함)\n"
        "2. 실제 예시와 코드 예시\n"
        "3. 기초 연습 문제 3개 (각 문제 후 정답을 아래 형식으로 작성)\n\n"
        "**정답:** (정답 내용)\n\n"
        "핵심 키워드는 **굵게**, 문제는 개념 이해를 확인할 수 있게.\n\n"
    ),
    "advanced": (
        "당신은 엄격한 학습 튜터입니다. 아래 주제에 대해:\n"
        "1. 중급~고급 수준 문제 2~3개 제시\n"
        "2. 각 문제의 단계별 풀이 과정\n"
        "3. 핵심 풀이 전략과 주의사항\n\n"
        "설명보다 문제풀이 중심으로, 핵심 키워드는 **굵게**.\n\n"
    ),
}

RETRY_STATUSES = {429, 503}
BASE_DELAYS = [1.0, 2.0, 4.0]


def _retry_sleep(delay: float) -> None:
    time.sleep(delay + random.uniform(0, 0.4))


def ask_ollama(prompt: str, model: str = "qwen2.5:7b", base_url: str = "http://localhost:11434") -> dict:
    start = time.time()
    label = f"Ollama · {model}"
    for delay in [*BASE_DELAYS, None]:
        try:
            resp = requests.post(
                f"{base_url.rstrip('/')}/api/generate",
                json={"model": model, "prompt": prompt, "stream": False},
                timeout=180,
            )
        except requests.RequestException as e:
            if delay is None:
                msg = "타임아웃 (180s)" if isinstance(e, requests.exceptions.Timeout) else str(e)
                return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": msg}
            _retry_sleep(delay)
            continue

        elapsed = round(time.time() - start, 2)
        if resp.status_code == 200:
            try:
                text = resp.json().get("response", "").strip()
            except Exception as e:
                return {"model": label, "response": "", "elapsed": elapsed, "error": f"응답 파싱 오류: {e}"}
            return {"model": label, "response": text, "elapsed": elapsed, "error": None}
        if resp.status_code in RETRY_STATUSES and delay is not None:
            _retry_sleep(delay)
            continue
        return {"model": label, "response": "", "elapsed": elapsed, "error": f"HTTP {resp.status_code}"}

    return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": "재시도 초과"}


def ask_groq(prompt: str, api_key: str, model: str = "llama-3.3-70b-versatile") -> dict:
    start = time.time()
    label = f"Groq · {model}"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 4096,
        "temperature": 0.7,
    }
    for delay in [*BASE_DELAYS, None]:
        try:
            resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=body, timeout=60)
        except requests.RequestException as e:
            if delay is None:
                return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": str(e)}
            _retry_sleep(delay)
            continue

        elapsed = round(time.time() - start, 2)
        if resp.status_code == 200:
            try:
                choices = resp.json().get("choices") or []
                if not choices:
                    return {"model": label, "response": "", "elapsed": elapsed, "error": "응답이 비어 있습니다."}
                text = choices[0].get("message", {}).get("content", "").strip()
                if not text:
                    return {"model": label, "response": "", "elapsed": elapsed, "error": "응답이 비어 있습니다."}
            except Exception as e:
                return {"model": label, "response": "", "elapsed": elapsed, "error": f"응답 파싱 오류: {e}"}
            return {"model": label, "response": text, "elapsed": elapsed, "error": None}
        if resp.status_code in RETRY_STATUSES and delay is not None:
            _retry_sleep(delay)
            continue

        msgs = {
            400: "요청 형식 오류입니다.",
            401: "API 키가 올바르지 않습니다.",
            403: "API 키 권한이 없거나 청구 계정이 연결되지 않았습니다.",
            429: "요청이 너무 많습니다.",
            503: "서비스를 일시적으로 사용할 수 없습니다.",
        }
        return {"model": label, "response": "", "elapsed": elapsed, "error": msgs.get(resp.status_code, f"HTTP {resp.status_code}")}

    return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": "재시도 초과"}


def ask_gemini(prompt: str, api_key: str, model: str = "gemini-2.5-flash") -> dict:
    start = time.time()
    label = f"Gemini · {model}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 4096, "temperature": 0.7},
    }
    for delay in [*BASE_DELAYS, None]:
        try:
            resp = requests.post(url, headers=headers, json=body, timeout=60)
        except requests.RequestException as e:
            if delay is None:
                return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": str(e)}
            _retry_sleep(delay)
            continue

        elapsed = round(time.time() - start, 2)
        if resp.status_code == 200:
            try:
                candidates = resp.json().get("candidates") or []
                if not candidates:
                    return {"model": label, "response": "", "elapsed": elapsed, "error": "응답이 비어 있습니다."}
                text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if not text:
                    return {"model": label, "response": "", "elapsed": elapsed, "error": "응답이 비어 있습니다."}
            except Exception as e:
                return {"model": label, "response": "", "elapsed": elapsed, "error": f"응답 파싱 오류: {e}"}
            return {"model": label, "response": text, "elapsed": elapsed, "error": None}
        if resp.status_code in RETRY_STATUSES and delay is not None:
            _retry_sleep(delay)
            continue

        msgs = {
            400: "요청 형식 오류입니다.",
            401: "API 키가 올바르지 않습니다.",
            403: "API 키 권한이 없거나 청구 계정이 연결되지 않았습니다.",
            429: "요청이 너무 많습니다.",
            503: "서비스를 일시적으로 사용할 수 없습니다.",
        }
        return {"model": label, "response": "", "elapsed": elapsed, "error": msgs.get(resp.status_code, f"HTTP {resp.status_code}")}

    return {"model": label, "response": "", "elapsed": round(time.time() - start, 2), "error": "재시도 초과"}


def build_prompt(mode: str, question: str) -> str:
    return PROMPTS[mode] + question


def ask_all(targets: list[dict], prompt: str) -> list[dict]:
    """targets: [{"provider":"ollama","model":..,"base_url":..}, {"provider":"groq","api_key":..}, ...]"""
    if not targets:
        return []
    results = [None] * len(targets)

    def call(idx: int, t: dict) -> tuple[int, dict]:
        p = t["provider"]
        if p == "ollama":
            return idx, ask_ollama(prompt, t.get("model", "qwen2.5:7b"), t.get("base_url", "http://localhost:11434"))
        if p == "groq":
            return idx, ask_groq(prompt, t.get("api_key", ""), t.get("model", "llama-3.3-70b-versatile"))
        if p == "gemini":
            return idx, ask_gemini(prompt, t.get("api_key", ""), t.get("model", "gemini-2.5-flash"))
        return idx, {"model": p, "response": "", "elapsed": 0.0, "error": f"알 수 없는 provider: {p}"}

    with ThreadPoolExecutor(max_workers=len(targets)) as executor:
        futures = {executor.submit(call, i, t): i for i, t in enumerate(targets)}
        for future in as_completed(futures):
            try:
                idx, result = future.result()
            except Exception as e:
                idx = futures[future]
                result = {"model": targets[idx].get("provider", "unknown"), "response": "", "elapsed": 0.0, "error": f"내부 오류: {e}"}
            results[idx] = result

    return results
