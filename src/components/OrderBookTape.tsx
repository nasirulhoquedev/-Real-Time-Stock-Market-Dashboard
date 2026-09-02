import React from "react";
import { OrderBookLevel, TradeTape, StockQuote } from "../types";
import { STOCKS_CATALOG } from "../data/stocksData";
import { ListFilter, ArrowUpDown, Clock } from "lucide-react";

interface OrderBookTapeProps {
  currentPrice: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  trades: TradeTape[];
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
}

export const OrderBookTape: React.FC<OrderBookTapeProps> = ({
  currentPrice,
  bids,
  asks,
  trades,
  currentSymbol,
  onSelectSymbol,
}) => {
  const highestBid = bids[0]?.price ?? currentPrice - 0.05;
  const lowestAsk = asks[0]?.price ?? currentPrice + 0.05;
  const spread = Math.max(0.01, Number((lowestAsk - highestBid).toFixed(2)));
  const spreadPct = Number(((spread / currentPrice) * 100).toFixed(3));

  const maxBidTotal = bids[bids.length - 1]?.total || 1;
  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="w-full bg-[#050505] p-6 lg:p-8 border-b border-white/10 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Panel 1: Live Watchlist */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-[#00FF00]" />
              <span>Market Watchlist</span>
            </span>
            <span className="text-[10px] text-white/30 font-mono font-bold tracking-widest uppercase">10 Tickers</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin">
            {Object.values(STOCKS_CATALOG).map((stock) => {
              const isSelected = stock.symbol === currentSymbol;
              const isPos = stock.change >= 0;
              return (
                <button
                  key={stock.symbol}
                  id={`watchlist-item-${stock.symbol}`}
                  onClick={() => onSelectSymbol(stock.symbol)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-[#00FF00]/15 border border-[#00FF00]/40 shadow-[0_0_12px_rgba(0,255,0,0.1)]"
                      : "hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-white tracking-tight">{stock.symbol}</span>
                      <span className="text-[10px] text-white/40 truncate max-w-[90px] font-medium">{stock.name}</span>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider font-mono">{stock.sector}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-white">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-[11px] font-mono font-black ${
                        isPos ? "text-[#00FF00]" : "text-[#FF3B3B]"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Live L2 Order Book */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-[#00FF00]" />
              <span>Level 2 Order Book</span>
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              Spread: <strong className="text-white">${spread}</strong> ({spreadPct}%)
            </span>
          </div>

          <div className="text-[11px] font-mono flex-1 flex flex-col justify-between">
            {/* Header */}
            <div className="flex justify-between text-white/30 text-[9px] uppercase font-black tracking-[0.2em] pb-1.5 border-b border-white/10">
              <span>Price ($)</span>
              <span>Size</span>
              <span>Total</span>
            </div>

            {/* Asks (Sells) - Reversed so lowest ask is closest to spread */}
            <div className="space-y-1 py-1">
              {[...asks].reverse().map((ask, i) => {
                const depthPct = (ask.total / maxTotal) * 100;
                return (
                  <div key={`ask-${i}`} className="relative flex justify-between py-1 px-1.5 rounded overflow-hidden">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#FF3B3B]/10 pointer-events-none"
                      style={{ width: `${depthPct}%` }}
                    />
                    <span className="text-[#FF3B3B] font-black z-10">${ask.price.toFixed(2)}</span>
                    <span className="text-white/80 z-10">{ask.size}</span>
                    <span className="text-white/40 z-10">{ask.total}</span>
                  </div>
                );
              })}
            </div>

            {/* Spread Divider with Current Price */}
            <div className="py-1.5 px-3 my-2 bg-white/[0.04] rounded flex items-center justify-between border border-white/10">
              <span className="text-sm font-mono font-black text-white tracking-tight">
                ${currentPrice.toFixed(2)}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/40">Mid Market</span>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-1 py-1">
              {bids.map((bid, i) => {
                const depthPct = (bid.total / maxTotal) * 100;
                return (
                  <div key={`bid-${i}`} className="relative flex justify-between py-1 px-1.5 rounded overflow-hidden">
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#00FF00]/10 pointer-events-none"
                      style={{ width: `${depthPct}%` }}
                    />
                    <span className="text-[#00FF00] font-black z-10">${bid.price.toFixed(2)}</span>
                    <span className="text-white/80 z-10">{bid.size}</span>
                    <span className="text-white/40 z-10">{bid.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 3: Live Time & Sales Tape */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <span className="text-[11px] font-black text-white/50 uppercase tracking-[0.25em] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00FF00]" />
              <span>Real-Time Market Tape</span>
            </span>
            <span className="text-[10px] text-[#00FF00] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF00] shadow-[0_0_6px_#00FF00] animate-pulse" />
              Streaming
            </span>
          </div>

          <div className="text-[11px] font-mono flex flex-col flex-1">
            <div className="flex justify-between text-white/30 text-[9px] uppercase font-black tracking-[0.2em] pb-1.5 border-b border-white/10">
              <span>Time</span>
              <span>Price ($)</span>
              <span>Size</span>
              <span>Side</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[275px] pt-1.5 pr-1 scrollbar-thin">
              {trades.map((trade) => {
                const isBuy = trade.side === "BUY";
                return (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded bg-white/[0.02] border border-white/10"
                  >
                    <span className="text-white/40">{trade.time}</span>
                    <span className={`font-black ${isBuy ? "text-[#00FF00]" : "text-[#FF3B3B]"}`}>
                      ${trade.price.toFixed(2)}
                    </span>
                    <span className="text-white/80 font-bold">{trade.size}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        isBuy ? "bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/30" : "bg-[#FF3B3B]/15 text-[#FF3B3B] border border-[#FF3B3B]/30"
                      }`}
                    >
                      {trade.side}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
