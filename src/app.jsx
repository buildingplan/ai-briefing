import { useState } from "react";

const TODAY = new Date().toLocaleDateString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "long"
});

const sentimentMeta = {
  bullish: { label: "▲ 강세장", color: "#00c896", bg: "rgba(0,200,150,0.12)", border: "rgba(0,200,150,0.25)" },
  bearish: { label: "▼ 약세장", color: "#ff4d6d", bg: "rgba(255,77,109,0.12)", border: "rgba(255,77,109,0.25)" },
  neutral: { label: "— 중립", color: "#f5c842", bg: "rgba(245,200,66,0.12)", border: "rgba(245,200,66,0.25)" },
};

export default function App() {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const sm = briefing ? (sentimentMeta[briefing.sentiment] || sentimentMeta.neutral) : null;

  const generate = async () => {
    setLoading(true);
    setFadeIn(false);
    setBriefing(null);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const parsed = await res.json();
      setBriefing(parsed);
      setTimeout(() => setFadeIn(true), 80);
    } catch {
      alert("생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080d1a", color: "#dde3f0", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fade { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
        .fade.in { opacity: 1; transform: translateY(0); }
        .hdr { display: flex; align-items: center; justify-content: space-between; padding: 20px 36px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 10; }
        .hdr-left { display: flex; align-items: center; gap: 12px; }
        .hdr-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #00c896 0%, #0055ff 100%); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .hdr-title { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; color: #00c896; letter-spacing: 0.08em; }
        .hdr-sub { font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 0.12em; margin-top: 2px; }
        .date-pill { font-size: 11px; font-family: 'DM Mono', monospace; color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.04); padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.07); }
        .gen-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
        .gen-title { font-size: 28px; font-weight: 700; color: #eef2ff; margin-bottom: 8px; text-align: center; }
        .gen-sub { font-size: 14px; color: rgba(255,255,255,0.35); text-align: center; }
        .gen-btn { display: inline-flex; align-items: center; gap: 10px; padding: 16px 44px; border-radius: 50px; border: none; cursor: pointer; font-size: 16px; font-weight: 700; font-family: 'Noto Sans KR', sans-serif; background: linear-gradient(135deg, #00c896, #0055ff); color: #fff; box-shadow: 0 4px 32px rgba(0,200,150,0.3); transition: all 0.25s ease; margin-top: 12px; }
        .gen-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 48px rgba(0,200,150,0.45); }
        .gen-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .spin { animation: spin 0.9s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 20px; }
        .loading-ring { width: 56px; height: 56px; border: 3px solid rgba(0,200,150,0.15); border-top: 3px solid #00c896; border-radius: 50%; animation: spin 1s linear infinite; }
        .loading-text { font-size: 14px; color: rgba(255,255,255,0.4); animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        .content { max-width: 860px; margin: 0 auto; padding: 28px 20px 60px; }
        .summary-hero { border-radius: 20px; padding: 30px 32px; margin-bottom: 20px; background: linear-gradient(135deg, rgba(0,200,150,0.07) 0%, rgba(0,85,255,0.07) 100%); border: 1px solid rgba(0,200,150,0.15); position: relative; overflow: hidden; }
        .summary-hero::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #00c896, #0055ff, #00c896); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
        @keyframes shimmer { to { background-position: 200% 0; } }
        .s-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .s-badge { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; padding: 6px 16px; border-radius: 20px; }
        .s-label { font-size: 10px; font-family: 'DM Mono', monospace; color: rgba(255,255,255,0.25); letter-spacing: 0.15em; }
        .s-text { font-size: 20px; font-weight: 700; line-height: 1.5; margin-bottom: 18px; color: #eef2ff; }
        .s-advice { display: flex; gap: 12px; align-items: flex-start; background: rgba(0,0,0,0.2); border-radius: 12px; padding: 14px 16px; }
        .s-advice-text { font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.65; font-weight: 300; }
        .refresh-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; border-radius: 50px; border: 1px solid rgba(0,200,150,0.25); background: rgba(0,200,150,0.08); color: #00c896; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Noto Sans KR', sans-serif; margin-bottom: 20px; transition: all 0.2s; }
        .refresh-btn:hover { background: rgba(0,200,150,0.15); }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 600px) { .grid2 { grid-template-columns: 1fr; } .hdr { padding: 16px; flex-wrap: wrap; gap: 8px; } }
        .card { background: rgba(255,255,255,0.028); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 22px; }
        .card-lbl { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.28); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 16px; }
        .idx-row { display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start; }
        .idx-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        .idx-name { font-family: 'DM Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.35); margin-bottom: 3px; }
        .idx-val { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.55; font-weight: 300; }
        .hl-box { border-radius: 10px; padding: 11px 14px; margin-top: 10px; font-size: 12px; line-height: 1.55; font-weight: 500; }
        .macro-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-top: 14px; }
        @media (max-width: 600px) { .macro-grid { grid-template-columns: 1fr; } }
        .macro-item { background: rgba(255,255,255,0.03); border-radius: 10px; padding: 13px; }
        .macro-lbl { font-family: 'DM Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.28); letter-spacing: 0.12em; margin-bottom: 6px; }
        .macro-val { font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.55; font-weight: 300; }
        .tag-wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .tag { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; background: rgba(0,85,255,0.12); color: #6b9eff; border: 1px solid rgba(0,85,255,0.2); }
        .ev-list { margin-top: 14px; }
        .ev-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.6; font-weight: 300; align-items: flex-start; }
        .ev-item:last-child { border-bottom: none; }
        .ev-num { width: 20px; height: 20px; border-radius: 50%; background: rgba(0,200,150,0.12); color: #00c896; font-size: 10px; font-family: 'DM Mono', monospace; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
      `}</style>

      <div className="hdr">
        <div className="hdr-left">
          <div className="hdr-icon">📊</div>
          <div>
            <div className="hdr-title">AI INVEST LOUNGE</div>
            <div className="hdr-sub">DAILY MARKET INTELLIGENCE</div>
          </div>
        </div>
        <div className="date-pill">{TODAY}</div>
      </div>

      {!briefing && !loading && (
        <div className="gen-wrap">
          <div>
            <div className="gen-title">오늘의 AI 시장 브리핑</div>
            <div className="gen-sub">버튼을 누르면 AI가 오늘 시장 데이터를 분석합니다</div>
          </div>
          <button className="gen-btn" onClick={generate}>⚡ 오늘의 브리핑 생성</button>
        </div>
      )}

      {loading && (
        <div className="loading-wrap">
          <div className="loading-ring" />
          <div className="loading-text">AI가 오늘의 시장 데이터를 수집하고 있습니다...</div>
        </div>
      )}

      {briefing && (
        <div className="content">
          <div className={`fade ${fadeIn ? "in" : ""}`}>
            <button className="refresh-btn" onClick={generate} disabled={loading}>🔄 새로 생성</button>
            <div className="summary-hero">
              <div className="s-top">
                <div className="s-badge" style={{ background: sm.bg, color: sm.color, border: `1px solid ${sm.border}` }}>{sm.label}</div>
                <div className="s-label">TODAY'S MARKET BRIEF</div>
              </div>
              <div className="s-text">{briefing.summary}</div>
              <div className="s-advice">
                <div style={{ fontSize: 16, flexShrink: 0 }}>💡</div>
                <div className="s-advice-text">{briefing.one_line_advice}</div>
              </div>
            </div>
            <div className="grid2">
              <div className="card">
                <div className="card-lbl">🇰🇷 한국 시장</div>
                <div className="idx-row"><div className="idx-dot" style={{ background: "#00c896" }} /><div><div className="idx-name">KOSPI</div><div className="idx-val">{briefing.korea.kospi}</div></div></div>
                <div className="idx-row"><div className="idx-dot" style={{ background: "#6b9eff" }} /><div><div className="idx-name">KOSDAQ</div><div className="idx-val">{briefing.korea.kosdaq}</div></div></div>
                <div className="hl-box" style={{ background: "rgba(0,200,150,0.07)", color: "#00c896" }}>{briefing.korea.highlight}</div>
              </div>
              <div className="card">
                <div className="card-lbl">🇺🇸 미국 시장</div>
                <div className="idx-row"><div className="idx-dot" style={{ background: "#f5c842" }} /><div><div className="idx-name">S&P 500</div><div className="idx-val">{briefing.us.sp500}</div></div></div>
                <div className="idx-row"><div className="idx-dot" style={{ background: "#ff6b9d" }} /><div><div className="idx-name">NASDAQ</div><div className="idx-val">{briefing.us.nasdaq}</div></div></div>
                <div className="hl-box" style={{ background: "rgba(245,200,66,0.07)", color: "#f5c842" }}>{briefing.us.highlight}</div>
              </div>
            </div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-lbl">🌐 거시경제 지표</div>
              <div className="macro-grid">
                <div className="macro-item"><div className="macro-lbl">💱 원/달러 환율</div><div className="macro-val">{briefing.macro.exchange_rate}</div></div>
                <div className="macro-item"><div className="macro-lbl">🏦 금리 동향</div><div className="macro-val">{briefing.macro.interest}</div></div>
                <div className="macro-item"><div className="macro-lbl">🥇 금 / 원자재</div><div className="macro-val">{briefing.macro.commodity}</div></div>
              </div>
            </div>
            <div className="grid2">
              <div className="card">
                <div className="card-lbl">🎯 오늘의 주목 섹터</div>
                <div className="tag-wrap">{briefing.focus_sectors.map((s, i) => <div key={i} className="tag">{s}</div>)}</div>
              </div>
              <div className="card">
                <div className="card-lbl">📅 오늘의 주요 이벤트</div>
                <div className="ev-list">
                  {briefing.key_events.map((e, i) => (
                    <div key={i} className="ev-item">
                      <div className="ev-num">{i + 1}</div>
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
