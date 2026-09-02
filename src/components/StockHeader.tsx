import React, { useEffect, useState } from "react";
import { StockQuote } from "../types";
import { ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, BarChart2 } from "lucide-react";

interface StockHeaderProps {
  quote: StockQuote;
  lastTickDirection: "up" | "down" | "none";
}

export const StockHeader: React.FC<StockHeaderProps> = ({ quote, lastTickDirection }) => {
  const isPositive = quote.change >= 0;
  const [flashColor, setFlashColor] = useState<string>("");

  useEffect(() => {
    if (lastTickDirection === "up") {
      setFlashColor("bg-emerald-500/20 text-emerald-300");
    } else if (lastTickDirection === "down") {
      setFlashColor("bg-rose-500/20 text-rose-300");
    }
    const timer = setTimeout(() => {
      setFlashColor("");
    }, 600);
    return () => clearTimeout(timer);
  }, [quote.price, lastTickDirection]);

  // Calculate 52-week position percentage
  const week52Span = quote.week52High - quote.week52Low;
  const week52Progress =
    week52Span > 0 ? Math.min(100, Math.max(0, ((quote.price - quote.week52Low) / week52Span) * 100)) : 50;

  // Day range calculation
  const daySpan = quote.high - quote.low;
  const dayProgress =
    daySpan > 0 ? Math.min(100, Math.max(0, ((quote.price - quote.low) / daySpan) * 100)) : 50;

  return (
    <div className="w-full bg-[#050505] border-b border-white/10 p-6 lg:p-8 select-none">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        {/* Left: Instrument Name & Giant Bold Live Price */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[#00FF00] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.4em] mb-2">
                Primary Instrument
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white leading-none uppercase">
                {quote.name}
                <span className="text-white/20 font-mono text-2xl sm:text-3xl ml-3">
                  / {quote.symbol}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-white/5 text-white/70 border border-white/15">
                {quote.exchange}
              </span>
              <span className="px-2.5 py-1 text-[10px] font-black tracking-widest uppercase rounded bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/30">
                {quote.sector}
              </span>
            </div>
          </div>

          {/* Bold Giant Price Display */}
          <div className="mt-6 flex flex-wrap items-baseline gap-4 sm:gap-6">
            <span
              className={`text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none font-mono transition-colors duration-300 ${
                flashColor || "text-white"
              }`}
            >
              ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

            <div className="flex flex-col">
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tighter flex items-center leading-none ${
                  isPositive ? "text-[#00FF00]" : "text-[#FF3B3B]"
                }`}
              >
                {isPositive ? "+" : ""}${quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)
              </div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mt-1">
                Day Volatility
              </span>
            </div>
          </div>
        </div>

        {/* Right: 4-Column Bold Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 xl:max-w-2xl w-full">
          {/* Day Range */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3.5">
            <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.3em] mb-1">
              Day Range
            </p>
            <p className="text-base sm:text-lg font-black tracking-tighter font-mono text-white">
              ${quote.low.toFixed(1)} - ${quote.high.toFixed(1)}
            </p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#00FF00] h-full rounded-full transition-all duration-300 shadow-[0_0_6px_#00FF00]"
                style={{ width: `${dayProgress}%` }}
              />
            </div>
          </div>

          {/* 52W Range */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3.5">
            <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.3em] mb-1">
              52-Wk Range
            </p>
            <p className="text-base sm:text-lg font-black tracking-tighter font-mono text-white">
              ${quote.week52Low.toFixed(0)} - ${quote.week52High.toFixed(0)}
            </p>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#00FF00] h-full rounded-full transition-all duration-300"
                style={{ width: `${week52Progress}%` }}
              />
            </div>
          </div>

          {/* Volume */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3.5">
            <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.3em] mb-1">
              Volume (24H)
            </p>
            <p className="text-base sm:text-lg font-black tracking-tighter font-mono text-white">
              {(quote.volume / 1_000_000).toFixed(1)}M
            </p>
            <span className="text-[10px] text-white/40 font-mono tracking-wider">Avg: {quote.avgVolume}</span>
          </div>

          {/* Market Cap & PE */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3.5">
            <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.3em] mb-1">
              Market Cap
            </p>
            <p className="text-base sm:text-lg font-black tracking-tighter font-mono text-white">
              {quote.marketCap}
            </p>
            <span className="text-[10px] text-white/40 font-mono tracking-wider">P/E: {quote.peRatio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
