// Wikipedia 주제 → 한국어 위키 문서 슬러그 매핑
// 파일럿: Python "변수와 자료형" 한 항목만 먼저 적용
const WIKI_MAP = {
  "변수와 자료형": "변수_(컴퓨터_과학)",
};

export async function fetchWikiSummary(topicTitle, signal) {
  const slug = WIKI_MAP[topicTitle];
  if (!slug) return null;

  try {
    const res = await fetch(
      `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" }, signal }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract,
      url: data.content_urls?.desktop?.page ?? null,
    };
  } catch {
    return null;
  }
}
