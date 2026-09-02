import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Candle,
  StockQuote,
  MarketIndex,
  TimeframeOption,
  ChartTypeOption,
  ActiveIndicators,
  TradeTape,
  OrderBookLevel,
} from "./types";
import {
  STOCKS_CATALOG,
  INITIAL_MARKET_INDICES,
  generateHistoricalCandles,
  generateOrderBook,
  generateInitialTrades,
} from "./data/stocksData";
import { enrichCandlesWithIndicators, evaluateTechnicalSignals } from "./utils/indicators";
import { Navbar } from "./components/Navbar";
import { StockHeader } from "./components/StockHeader";
import { InteractiveChart } from "./components/InteractiveChart";
import { TechnicalSignalsPanel } from "./components/TechnicalSignals";
import { OrderBookTape } from "./components/OrderBookTape";
import { PythonProjectModal } from "./components/PythonProjectModal";
import {
  Sparkles,
  ExternalLink,
  Code2,
  Cpu,
  BarChart3,
  CheckCircle2,
  Layers,
} from "lucide-react";

export default function App() {
  const [currentSymbol, setCurrentSymbol] = useState<string>("AAPL");
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");
  const [chartType, setChartType] = useState<ChartTypeOption>("CANDLESTICK");
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(2000);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [lastTickDir, setLastTickDir] = useState<"up" | "down" | "none">("none");

  // Active indicators config
  const [indicators, setIndicators] = useState<ActiveIndicators>({
    bollingerBands: true,
    sma20: true,
    sma50: false,
    ema: false,
    volume: true,
    rsi: true,
    macd: true,
  });

  // Current stock quote data
  const [quote, setQuote] = useState<StockQuote>(() => STOCKS_CATALOG["AAPL"]);

  // Market indices
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>(INITIAL_MARKET_INDICES);

  // Candles data
  const [candles, setCandles] = useState<Candle[]>(() =>
    generateHistoricalCandles(STOCKS_CATALOG["AAPL"].price, "1M")
  );

  // Order book & tape
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookLevel[]; asks: OrderBookLevel[] }>(() =>
    generateOrderBook(STOCKS_CATALOG["AAPL"].price)
  );
  const [trades, setTrades] = useState<TradeTape[]>(() =>
    generateInitialTrades(STOCKS_CATALOG["AAPL"].price)
  );

  // Switch stock symbol
  const handleSelectSymbol = useCallback(
    (sym: string) => {
      const targetSym = sym.toUpperCase().trim();
      let targetQuote = STOCKS_CATALOG[targetSym];

      if (!targetQuote) {
        // Fallback custom stock
        targetQuote = {
          symbol: targetSym,
          name: `${targetSym} Global Holdings`,
          sector: "Financial / Technology",
          exchange: "NASDAQ",
          price: 154.2,
          change: 1.85,
          changePercent: 1.21,
          open: 152.5,
          high: 156.4,
          low: 151.9,
          previousClose: 152.35,
          volume: 24500000,
          avgVolume: "22.1M",
          marketCap: "$1.45T",
          peRatio: 28.5,
          week52High: 182.0,
          week52Low: 110.0,
          beta: 1.12,
          dividendYield: 0.005,
          description: `Custom tracked equity instrument for ${targetSym}. Real-time tracking and financial indicators active.`,
          ceo: "Executive Board",
          headquarters: "New York, USA",
        };
      }

      setCurrentSymbol(targetSym);
      setQuote(targetQuote);
      const newCandles = generateHistoricalCandles(targetQuote.price, timeframe);
      setCandles(newCandles);
      setOrderBook(generateOrderBook(targetQuote.price));
      setTrades(generateInitialTrades(targetQuote.price));
      setLastTickDir("none");
    },
    [timeframe]
  );

  // Handle timeframe change
  const handleChangeTimeframe = (tf: TimeframeOption) => {
    setTimeframe(tf);
    const newCandles = generateHistoricalCandles(quote.price, tf);
    setCandles(newCandles);
  };

  // Toggle indicator
  const handleToggleIndicator = (key: keyof ActiveIndicators) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Process live simulated market tick
  const triggerTick = useCallback(() => {
    setQuote((prevQuote) => {
      // Small random percentage movement (-0.35% to +0.35%)
      const tickDeltaPct = (Math.random() - 0.49) * 0.006;
      const priceDelta = prevQuote.price * tickDeltaPct;
      const newPrice = Math.max(1, Number((prevQuote.price + priceDelta).toFixed(2)));
      const newChange = Number((newPrice - prevQuote.previousClose).toFixed(2));
      const newChangePct = Number(((newChange / prevQuote.previousClose) * 100).toFixed(2));
      const newHigh = Math.max(prevQuote.high, newPrice);
      const newLow = Math.min(prevQuote.low, newPrice);
      const newVolume = prevQuote.volume + Math.floor(Math.random() * 2500 + 100);

      const direction = newPrice >= prevQuote.price ? "up" : "down";
      setLastTickDir(direction);

      // Add trade to tape
      const tradeSize = Math.floor(Math.random() * 200 + 10);
      const newTrade: TradeTape = {
        id: `t-${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        price: newPrice,
        size: tradeSize,
        side: direction === "up" ? "BUY" : "SELL",
      };
      setTrades((prev) => [newTrade, ...prev.slice(0, 15)]);

      // Update Order book
      setOrderBook(generateOrderBook(newPrice));

      // Update latest candle and recalculate indicators
      setCandles((prevCandles) => {
        if (prevCandles.length === 0) return prevCandles;
        const updated = [...prevCandles];
        const lastIdx = updated.length - 1;
        const currentCandle = updated[lastIdx];

        updated[lastIdx] = {
          ...currentCandle,
          close: newPrice,
          high: Math.max(currentCandle.high, newPrice),
          low: Math.min(currentCandle.low, newPrice),
          volume: currentCandle.volume + tradeSize,
        };

        return enrichCandlesWithIndicators(updated);
      });

      // Update market indices slightly
      setMarketIndices((prev) =>
        prev.map((idx) => {
          const shift = (Math.random() - 0.49) * 0.001;
          const p = Number((idx.price * (1 + shift)).toFixed(2));
          const chg = Number((idx.change + (p - idx.price)).toFixed(2));
          return {
            ...idx,
            price: p,
            change: chg,
            changePercent: Number(((chg / p) * 100).toFixed(2)),
          };
        })
      );

      return {
        ...prevQuote,
        price: newPrice,
        change: newChange,
        changePercent: newChangePct,
        high: newHigh,
        low: newLow,
        volume: newVolume,
      };
    });
  }, []);

  // Streaming timer
  useEffect(() => {
    if (!isStreaming) return;
    const intervalId = setInterval(() => {
      triggerTick();
    }, streamSpeed);

    return () => clearInterval(intervalId);
  }, [isStreaming, streamSpeed, triggerTick]);

  // Compute live technical signals from latest candle
  const latestCandle = candles[candles.length - 1] || {
    date: "",
    timestamp: Date.now(),
    open: quote.price,
    high: quote.price,
    low: quote.price,
    close: quote.price,
    volume: 100000,
  };
  const technicalSignals = evaluateTechnicalSignals(latestCandle);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col antialiased selection:bg-[#00FF00] selection:text-black">
      {/* Top Header & Ticker Bar */}
      <Navbar
        currentSymbol={currentSymbol}
        onSelectSymbol={handleSelectSymbol}
        marketIndices={marketIndices}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
        streamSpeed={streamSpeed}
        onChangeStreamSpeed={(speed) => setStreamSpeed(speed)}
        onTriggerTick={triggerTick}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col border-x border-white/10">
        {/* Real-Time Price & Key Metrics Header */}
        <StockHeader quote={quote} lastTickDirection={lastTickDir} />

        {/* Interactive Candlestick / Subplot Chart */}
        <InteractiveChart
          candles={candles}
          timeframe={timeframe}
          onChangeTimeframe={handleChangeTimeframe}
          chartType={chartType}
          onChangeChartType={(ct) => setChartType(ct)}
          indicators={indicators}
          onToggleIndicator={handleToggleIndicator}
          symbol={currentSymbol}
        />

        {/* Technical Signals, Momentum & Moving Averages Intelligence */}
        <TechnicalSignalsPanel signals={technicalSignals} quote={quote} />

        {/* Order Book, Real-Time Market Tape & Watchlist */}
        <OrderBookTape
          currentPrice={quote.price}
          bids={orderBook.bids}
          asks={orderBook.asks}
          trades={trades}
          currentSymbol={currentSymbol}
          onSelectSymbol={handleSelectSymbol}
        />

        {/* Educational / Curriculum Project Reference Banner */}
        <section className="p-4 lg:p-6 bg-[#050505] border-t border-white/10">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/30 flex items-center justify-center text-[#00FF00] shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[#00FF00] text-[10px] font-black uppercase tracking-[0.3em] mb-1">
                  Python Curriculum Spec
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  Real-Time Stock Market Dashboard
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  Technologies verified: <span className="text-white font-mono font-bold">Python (Pandas, Plotly, Requests API), Streamlit</span>. Complete source suite (<code className="text-[#00FF00]">app.py</code>, <code className="text-[#00FF00]">indicators.py</code>, <code className="text-[#00FF00]">data_fetcher.py</code>) ready in workspace.
                </p>
              </div>
            </div>

            <button
              id="btn-inspect-python-project"
              onClick={() => setIsPythonModalOpen(true)}
              className="px-5 py-3 text-xs font-black uppercase tracking-widest rounded bg-white text-black hover:bg-[#00FF00] hover:text-black transition-all shadow-[0_0_15px_rgba(0,255,0,0.15)] font-sans shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              <span>Inspect Python Code</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#050505] border-t border-white/10 py-5 px-6 text-center text-xs text-white/40 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <span className="font-black uppercase tracking-[0.2em] text-white/50">
            Real-Time Stock Market Dashboard • Financial Terminal
          </span>
          <span className="text-[10px] uppercase tracking-widest text-white/30">
            React 19 + TypeScript + Tailwind + Python (Pandas + Plotly + Streamlit)
          </span>
        </div>
      </footer>

      {/* Python Project Code Viewer & Exporter Modal */}
      <PythonProjectModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />
    </div>
  );
}
