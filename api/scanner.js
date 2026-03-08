export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });

  try {
    // 실시간 주식 데이터 가져오기 (한국 + 미국 주요 종목)
    const tickers = [
      "005930.KS", // 삼성전자
      "000660.KS", // SK하이닉스
      "035420.KS", // NAVER
      "051910.KS", // LG화학
      "006400.KS", // 삼성SDI
      "NVDA", "TSLA", "AAPL", "MSFT", "META"
    ];

    const tickerStr = tickers.join(",");
    const yahooRes = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${tickerStr}&fields=shortName,regularMarketPrice,regularMarketChangePercent,regularMarketVolume,averageVolume`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const yahooData = await yahooRes.json();
    const quotes = yahooData.quoteResponse.result;

    // 거래량 급증 및 등락률 기준으로 정렬
    const sorted = quotes
      .map(q => ({
        name: q.shortName || q.symbol,
        ticker: q.symbol,
        price: q.regularMarketPrice,
        changePercent: q.regularMarketChangePercent?.toFixed(2),
        volumeRatio: q.regularMarketVolume / (q.averageVolume || 1),
        market: q.symbol.includes(".KS") ? "KR" : "US"
      }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    // AI에게 실제 데이터 기반 분석 요청
    const stockSummary = sorted.map(s =>
      `${s.name}(${s.ticker}): 가격 ${s.price}, 등락률 ${s.changePercent}%, 거래량비율 ${s.volumeRatio?.toFixed(1)}x`
    ).join("\n");

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
        system: `당신은 AI 투자 공유오피스의 종목 스캐너 AI입니다. 아래 실시간 주식 데이터를 분석해서 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.
{
  "theme": "오늘의 핵심 투자 테마 한 줄",
  "stocks": [
    {
      "name": "종목명",
      "ticker": "티커심볼",
      "market": "KR 또는 US",
      "reason": "주목 이유 (실제 데이터 기반, 30자 이내)",
      "signal": "strong_buy 또는 buy 또는 watch",
      "category": "거래량급증 또는 모멘텀 또는 테마주 또는 실적호조 또는 기술적돌파"
    }
  ],
  "caution": "오늘 투자 시 주의사항 한 줄"
}
한국 3개, 미국 3개 총 6개 종목을 실제 데이터 기반으로 선정하세요.`,
        messages: [{
          role: "user",
          content: `오늘은 ${today}입니다. 아래 실시간 데이터를 분석해서 주목 종목 6개를 JSON으로 생성해주세요.\n\n${stockSummary}`
        }]
      })
    });

    const data = await response.json();
    const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());

    // 실제 가격 데이터도 함께 반환
    parsed.stocks = parsed.stocks.map(stock => {
      const realData = sorted.find(s => s.ticker === stock.ticker);
      return {
        ...stock,
        price: realData?.price,
        changePercent: realData?.changePercent
      };
    });

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
