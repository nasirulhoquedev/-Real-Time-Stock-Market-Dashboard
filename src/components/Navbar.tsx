import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  Play,
  Pause,
  Zap,
  FileCode2,
  Search,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { MarketIndex } from "../types";
import { STOCKS_CATALOG } from "../data/stocksData";

interface NavbarProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  marketIndices: MarketIndex[];
  isStreaming: boolean;
  onToggleStreaming: () => void;
  streamSpeed: number;
  onChangeStreamSpeed: (speed: number) => void;
  onTriggerTick: () => void;
  onOpenPythonModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSymbol,
  onSelectSymbol,
  marketIndices,
  isStreaming,
  onToggleStreaming,
  streamSpeed,
  onChangeStreamSpeed,
  onTriggerTick,
  onOpenPythonModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const availableSymbols = Object.keys(STOCKS_CATALOG);

  const filteredSymbols = availableSymbols.filter(
    (sym) =>
      sym.toLowerCase().includes(searchQuery.toLowerCase()) ||
      STOCKS_CATALOG[sym].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.toUpperCase().trim();
    if (clean) {
      onSelectSymbol(clean);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="w-full bg-[#050505] border-b border-white/10 sticky top-0 z-30 select-none">
      {/* Top Global Indices Ticker Bar */}
      <div className="w-full bg-[#050505] border-b border-white/10 px-6 py-2 overflow-x-auto scrollbar-none flex items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-2 text-white/50 shrink-0 pr-4 border-r border-white/10">
          <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">LIVE MARKET FEED</span>
        </div>

        <div className="flex items-center gap-8 shrink-0 overflow-x-auto">
          {marketIndices.map((idx) => {
            const isPos = idx.change >= 0;
            return (
              <div key={idx.symbol} className="flex items-center gap-2">
                <span className="text-white/40 font-black text-[10px] uppercase tracking-wider">{idx.name}</span>
                <span className="text-white font-mono font-bold text-xs">{idx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`text-[11px] font-mono font-black ${isPos ? "text-[#00FF00]" : "text-[#FF3B3B]"}`}>
                  {isPos ? "+" : ""}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center text-[10px] font-mono tracking-widest text-white/40 shrink-0 uppercase">
          SEC FEED • REALTIME
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Ticker Dropdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2 pr-6 border-r border-white/10">
            <span className="text-2xl font-black tracking-tighter uppercase text-[#00FF00]">
              MarketPulse.
            </span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hidden sm:inline">
              Terminal
            </span>
          </div>

          {/* Quick Stock Selector Pills */}
          <div className="hidden lg:flex items-center gap-2">
            {["AAPL", "NVDA", "MSFT", "GOOGL", "TSLA", "META", "SPY"].map((sym) => (
              <button
                key={sym}
                id={`btn-ticker-${sym}`}
                onClick={() => onSelectSymbol(sym)}
                className={`px-3 py-1 text-xs font-black tracking-wider uppercase transition-all ${
                  currentSymbol === sym
                    ? "bg-[#00FF00] text-black shadow-[0_0_10px_rgba(0,255,0,0.3)] font-black"
                    : "text-white/40 hover:text-white hover:bg-white/5 border border-white/10"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Streaming Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Symbol Search Input */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-white/40 pointer-events-none" />
              <input
                id="input-stock-search"
                type="text"
                placeholder="SEARCH SYMBOL (NVDA, AMZN)..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-48 sm:w-60 text-xs bg-white/[0.02] border border-white/15 rounded text-white placeholder-white/30 focus:outline-none focus:border-[#00FF00] font-mono uppercase tracking-wider"
              />
            </form>

            {isSearchOpen && searchQuery && (
              <div className="absolute left-0 mt-1 w-64 bg-[#0a0a0a] border border-white/15 rounded shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
                {filteredSymbols.length > 0 ? (
                  filteredSymbols.map((sym) => (
                    <button
                      key={sym}
                      id={`search-result-${sym}`}
                      onClick={() => {
                        onSelectSymbol(sym);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center justify-between text-white"
                    >
                      <div className="font-mono font-black text-[#00FF00]">{sym}</div>
                      <div className="text-[11px] text-white/40 truncate max-w-[140px] font-bold">
                        {STOCKS_CATALOG[sym]?.name || "Stock"}
                      </div>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      onSelectSymbol(searchQuery.toUpperCase().trim());
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[#00FF00] font-mono font-bold"
                  >
                    Track Custom Ticker: "{searchQuery.toUpperCase()}"
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Live Feed Toggle & Controls */}
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/15 rounded p-1">
            <button
              id="btn-toggle-stream"
              onClick={onToggleStreaming}
              title={isStreaming ? "Pause Live Tick Feed" : "Resume Live Tick Feed"}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 transition-all ${
                isStreaming
                  ? "bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/40 shadow-[0_0_8px_rgba(0,255,0,0.2)]"
                  : "bg-white/10 text-white/50 hover:text-white"
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span className="hidden sm:inline">LIVE FEED</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span className="hidden sm:inline">PAUSED</span>
                </>
              )}
            </button>

            <button
              id="btn-trigger-tick"
              onClick={onTriggerTick}
              title="Manually simulate a market tick"
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#00FF00]" />
            </button>

            <div className="hidden md:flex items-center gap-1 text-[11px] text-white/40 pl-2 border-l border-white/10">
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30 mr-1">INTERVAL:</span>
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  id={`btn-speed-${speed}s`}
                  onClick={() => onChangeStreamSpeed(speed * 1000)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    streamSpeed === speed * 1000
                      ? "bg-white text-black font-black"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {speed}s
                </button>
              ))}
            </div>
          </div>

          {/* Python & Streamlit Code Hub Modal Button */}
          <button
            id="btn-python-code-hub"
            onClick={onOpenPythonModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded bg-white text-black hover:bg-[#00FF00] hover:text-black transition-all cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Python Code Hub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
