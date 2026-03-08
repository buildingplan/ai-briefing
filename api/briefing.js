export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: `당신은 AI 투자 공유오피스의 전문 시장 브리핑 AI입니다. 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "summary": "오늘 시장 한줄 요약 (40자 이내)",
  "sentiment": "bullish 또는 bearish 또는 neutral",
  "korea": { "kospi": "코스피 동향", "kosdaq": "코스닥 동향", "highlight": "한국 시장 핵심 포인트" },
  "us": { "sp500": "S&P500 동향", "nasdaq": "나스닥 동향", "highlight": "미국 시장 핵심 포인트" },
  "macro": { "exchange_rate": "원달러 환율 동향", "interest": "금리 동향", "commodity": "금/유가 동향" },
  "focus_sectors": ["섹터1", "섹터2", "섹터3", "섹터4", "섹터5"],
  "key_events": ["이벤트1", "이벤트2", "이벤트3"],
  "one_line_advice": "오늘 투자자 핵심 한마디"
}`,
        messages: [{ role: "user", content: `오늘은 ${today}입니다. 시장 브리핑 JSON을 생성해주세요.` }]
      })
    });

    const data = await response.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
