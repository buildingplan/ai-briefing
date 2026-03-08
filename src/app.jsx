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
        system: `당신은 AI 투자 공유오피스의 종목 스캐너 AI입니다. 오늘 날짜 기준으로 주목할 만한 한국/미국 종목을 분석해서 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "theme": "오늘의 핵심 투자 테마 한 줄",
  "stocks": [
    {
      "name": "종목명",
      "ticker": "티커심볼",
      "market": "KR 또는 US",
      "reason": "주목 이유 (30자 이내)",
      "signal": "strong_buy 또는 buy 또는 watch",
      "category": "거래량급증 또는 모멘텀 또는 테마주 또는 실적호조 또는 기술적돌파",
      "price": "예상 현재가 (숫자만)",
      "changePercent": "등락률 예상 (숫자만, 예: 2.5 또는 -1.3)"
    }
  ],
  "caution": "오늘 투자 시 주의사항 한 줄"
}
한국 3개, 미국 3개 총 6개 종목을 선정하세요.`,
        messages: [{ role: "user", content: `오늘은 ${today}입니다. 주목 종목 6개를 JSON으로 생성해주세요.` }]
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
