import React from "react";
import { TechnicalSignals, StockQuote } from "../types";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

interface TechnicalSignalsProps {
  signals: TechnicalSignals;
  quote: StockQuote;
}

export const TechnicalSignalsPanel: React.FC<TechnicalSignalsProps> = ({ signals, quote }) => {
  const getRatingBadge = (rating: TechnicalSignals["overallRating"]) => {
    switch (rating) {
      case "STRONG_BUY":
        return { text: "Strong Buy", bg: "bg-[#00FF00]/20 text-[#00FF00] border-[#00FF00]/50" };
      case "BUY":
        return { text: "Buy", bg: "bg-[#00FF00]/10 text-[#00FF00] border-[#00FF00]/30" };
      case "STRONG_SELL":
        return { text: "Strong Sell", bg: "bg-[#FF3B3B]/20 text-[#FF3B3B] border-[#FF3B3B]/50" };
      case "SELL":
        return { text: "Sell", bg: "bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30" };
      default:
        return { text: "Neutral", bg: "bg-white/10 text-white/80 border-white/20" };
    }
  };

  const ratingInfo = getRatingBadge(signals.overallRating);

  return (
    <div className="w-full bg-[#050505] border-b border-white/10 p-6 lg:p-8 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Overall Technical Sentiment */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/50 font-black text-[10px] tracking-[0.25em] uppercase">
                <Compass className="w-4 h-4 text-[#00FF00]" />
                <span>Technical Sentiment</span>
              </div>
              <span
                className={`px-3 py-1 text-xs font-black font-mono uppercase tracking-widest rounded border ${ratingInfo.bg}`}
              >
                {ratingInfo.text}
              </span>
            </div>

            <p className="text-xs text-white/50 leading-relaxed mb-5 font-medium">
              Composite quantitative model evaluating RSI momentum, MACD histogram crossovers, and exponential moving average alignment.
            </p>

            {/* Visual Rating Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider font-mono text-white/40">
                <span className="text-[#FF3B3B]">Strong Sell</span>
                <span className="text-white/60">Neutral</span>
                <span className="text-[#00FF00]">Strong Buy</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 relative overflow-hidden flex">
                <div className="h-full w-1/4 bg-[#FF3B3B]/50" />
                <div className="h-full w-1/4 bg-[#FF3B3B]/20" />
                <div className="h-full w-1/4 bg-white/20" />
                <div className="h-full w-1/4 bg-[#00FF00]/50" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
            <span>Beta: <strong className="text-white font-bold">{quote.beta}</strong></span>
            <span>Div Yield: <strong className="text-white font-bold">{(quote.dividendYield * 100).toFixed(2)}%</strong></span>
          </div>
        </div>

        {/* Card 2: Momentum & Oscillators (RSI & MACD) */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/50 font-black text-[10px] tracking-[0.25em] uppercase mb-4">
              <Activity className="w-4 h-4 text-[#00FF00]" />
              <span>Oscillators & Momentum</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* RSI */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 font-mono uppercase text-[10px] font-bold tracking-wider">RSI (14-Period):</span>
                  <span className="font-mono font-black text-sm text-[#00FF00]">{signals.rsiScore.value}</span>
                </div>
                <div className="text-[11px] text-white/70 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_6px_#00FF00]" />
                  <span>{signals.rsiScore.action}</span>
                </div>
              </div>

              {/* MACD */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 font-mono uppercase text-[10px] font-bold tracking-wider">MACD Hist:</span>
                  <span
                    className={`font-mono font-black text-sm ${
                      signals.macdScore.histogram >= 0 ? "text-[#00FF00]" : "text-[#FF3B3B]"
                    }`}
                  >
                    {signals.macdScore.histogram >= 0 ? "+" : ""}
                    {signals.macdScore.histogram}
                  </span>
                </div>
                <div className="text-[11px] text-white/70 flex items-center gap-2 font-mono">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      signals.macdScore.trend === "BULLISH"
                        ? "bg-[#00FF00] shadow-[0_0_6px_#00FF00]"
                        : "bg-[#FF3B3B] shadow-[0_0_6px_#FF3B3B]"
                    }`}
                  />
                  <span>{signals.macdScore.action}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Trend Structure & Volatility */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/50 font-black text-[10px] tracking-[0.25em] uppercase mb-4">
              <Layers className="w-4 h-4 text-[#00FF00]" />
              <span>Trend Structure & Bands</span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Moving Averages */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 font-mono uppercase text-[10px] font-bold tracking-wider">Moving Averages:</span>
                  <span
                    className={`font-mono font-black text-[11px] uppercase tracking-wider ${
                      signals.movingAverages.crossStatus === "GOLDEN_CROSS"
                        ? "text-[#00FF00]"
                        : "text-[#FF3B3B]"
                    }`}
                  >
                    {signals.movingAverages.crossStatus === "GOLDEN_CROSS" ? "Golden Cross" : "Bearish Trend"}
                  </span>
                </div>
                <div className="text-[11px] text-white/60 font-mono">
                  Price is <strong className="text-white">{signals.movingAverages.priceVsSma}</strong> 20-Day SMA (${signals.movingAverages.sma20})
                </div>
              </div>

              {/* Bollinger Bands */}
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/50 font-mono uppercase text-[10px] font-bold tracking-wider">Bollinger Bands:</span>
                  <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider">
                    {signals.bollingerBands.position.replace("_", " ")}
                  </span>
                </div>
                <div className="text-[11px] text-white/60 font-mono">
                  Upper: <span className="text-white font-mono">${signals.bollingerBands.upper}</span> • Lower: <span className="text-white font-mono">${signals.bollingerBands.lower}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Company Profile Brief */}
      <div className="mt-6 pt-6 border-t border-white/10 text-xs text-white/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <p className="line-clamp-2 md:line-clamp-1 max-w-4xl text-white/60 font-medium">
          <strong className="text-white font-black uppercase tracking-wider mr-1">About {quote.name}:</strong> {quote.description}
        </p>
        <div className="shrink-0 flex items-center gap-5 text-[11px] font-mono text-white/40">
          <span>CEO: <strong className="text-white">{quote.ceo}</strong></span>
          <span>HQ: <strong className="text-white">{quote.headquarters}</strong></span>
        </div>
      </div>
    </div>
  );
};
