import { StockQuote, MarketIndex, Candle, OrderBookLevel, TradeTape, TimeframeOption } from "../types";
import { enrichCandlesWithIndicators } from "../utils/indicators";

export const STOCKS_CATALOG: Record<string, StockQuote> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Consumer Electronics",
    exchange: "NASDAQ",
    price: 228.45,
    change: 3.82,
    changePercent: 1.70,
    open: 225.10,
    high: 229.80,
    low: 224.60,
    previousClose: 224.63,
    volume: 54820190,
    avgVolume: "52.4M",
    marketCap: "$3.48T",
    peRatio: 34.2,
    week52High: 237.23,
    week52Low: 164.08,
    beta: 1.05,
    dividendYield: 0.44,
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services.",
    ceo: "Tim Cook",
    headquarters: "Cupertino, California",
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    price: 129.60,
    change: 4.15,
    changePercent: 3.31,
    open: 125.80,
    high: 131.25,
    low: 125.10,
    previousClose: 125.45,
    volume: 82491200,
    avgVolume: "78.9M",
    marketCap: "$3.19T",
    peRatio: 52.8,
    week52High: 140.76,
    week52Low: 45.43,
    beta: 1.68,
    dividendYield: 0.03,
    description: "NVIDIA pioneered GPU-accelerated computing to tackle challenges that no one else can solve, dominating the global AI and datacenter processor landscape.",
    ceo: "Jensen Huang",
    headquarters: "Santa Clara, California",
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Software - Infrastructure",
    exchange: "NASDAQ",
    price: 452.10,
    change: -2.35,
    changePercent: -0.52,
    open: 455.00,
    high: 456.80,
    low: 450.90,
    previousClose: 454.45,
    volume: 22391040,
    avgVolume: "21.6M",
    marketCap: "$3.36T",
    peRatio: 36.4,
    week52High: 468.35,
    week52Low: 309.45,
    beta: 0.92,
    dividendYield: 0.67,
    description: "Microsoft produces computer software, consumer electronics, personal computers, Azure cloud computing platform, and related services.",
    ceo: "Satya Nadella",
    headquarters: "Redmond, Washington",
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Internet Content & Info",
    exchange: "NASDAQ",
    price: 184.20,
    change: 1.95,
    changePercent: 1.07,
    open: 182.50,
    high: 185.40,
    low: 181.80,
    previousClose: 182.25,
    volume: 24892010,
    avgVolume: "26.3M",
    marketCap: "$2.28T",
    peRatio: 26.8,
    week52High: 191.75,
    week52Low: 120.21,
    beta: 1.08,
    dividendYield: 0.43,
    description: "Alphabet Inc. is a multinational technology conglomerate holding company created through a restructuring of Google on October 2, 2015.",
    ceo: "Sundar Pichai",
    headquarters: "Mountain View, California",
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Internet Retail",
    exchange: "NASDAQ",
    price: 189.50,
    change: 2.10,
    changePercent: 1.12,
    open: 187.90,
    high: 190.40,
    low: 186.70,
    previousClose: 187.40,
    volume: 38102900,
    avgVolume: "41.2M",
    marketCap: "$1.98T",
    peRatio: 42.1,
    week52High: 201.20,
    week52Low: 118.35,
    beta: 1.15,
    dividendYield: 0.00,
    description: "Amazon focuses on e-commerce, cloud computing (AWS), online advertising, digital streaming, and artificial intelligence.",
    ceo: "Andy Jassy",
    headquarters: "Seattle, Washington",
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Auto Manufacturers",
    exchange: "NASDAQ",
    price: 221.30,
    change: -5.40,
    changePercent: -2.38,
    open: 226.00,
    high: 227.80,
    low: 219.50,
    previousClose: 226.70,
    volume: 64910200,
    avgVolume: "68.4M",
    marketCap: "$704.2B",
    peRatio: 64.5,
    week52High: 271.00,
    week52Low: 138.80,
    beta: 2.42,
    dividendYield: 0.00,
    description: "Tesla designs, develops, manufactures, sells, and leases electric vehicles, energy storage systems, and solar panels.",
    ceo: "Elon Musk",
    headquarters: "Austin, Texas",
  },
  META: {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Internet Content & Info",
    exchange: "NASDAQ",
    price: 518.75,
    change: 7.25,
    changePercent: 1.42,
    open: 512.40,
    high: 521.90,
    low: 511.00,
    previousClose: 511.50,
    volume: 14209300,
    avgVolume: "15.8M",
    marketCap: "$1.31T",
    peRatio: 27.2,
    week52High: 542.81,
    week52Low: 279.40,
    beta: 1.22,
    dividendYield: 0.38,
    description: "Meta builds technologies that help people connect, find communities, and grow businesses across Facebook, Instagram, WhatsApp, and Quest VR.",
    ceo: "Mark Zuckerberg",
    headquarters: "Menlo Park, California",
  },
  SPY: {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    sector: "Large Cap Blend ETF",
    exchange: "NYSE Arca",
    price: 562.40,
    change: 3.10,
    changePercent: 0.55,
    open: 559.80,
    high: 563.20,
    low: 559.20,
    previousClose: 559.30,
    volume: 48201900,
    avgVolume: "52.0M",
    marketCap: "$568B",
    peRatio: 26.1,
    week52High: 565.16,
    week52Low: 410.07,
    beta: 1.00,
    dividendYield: 1.22,
    description: "SPY seeks to provide investment results that correspond generally to the price and yield performance of the S&P 500 Index.",
    ceo: "State Street Global Advisors",
    headquarters: "Boston, Massachusetts",
  },
  QQQ: {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    sector: "Large Cap Growth ETF",
    exchange: "NASDAQ",
    price: 486.20,
    change: 4.80,
    changePercent: 1.00,
    open: 482.10,
    high: 487.50,
    low: 481.30,
    previousClose: 481.40,
    volume: 36291040,
    avgVolume: "38.5M",
    marketCap: "$294B",
    peRatio: 31.4,
    week52High: 503.52,
    week52Low: 351.36,
    beta: 1.18,
    dividendYield: 0.58,
    description: "Invesco QQQ tracks the Nasdaq-100 Index, featuring 100 of the largest non-financial innovative companies listed on Nasdaq.",
    ceo: "Invesco Capital Management",
    headquarters: "Downers Grove, Illinois",
  },
};

export const INITIAL_MARKET_INDICES: MarketIndex[] = [
  { symbol: "^GSPC", name: "S&P 500", price: 5648.40, change: 32.10, changePercent: 0.57 },
  { symbol: "^IXIC", name: "NASDAQ", price: 17713.65, change: 184.20, changePercent: 1.05 },
  { symbol: "^DJI", name: "DOW JONES", price: 41563.08, change: -45.12, changePercent: -0.11 },
  { symbol: "^RUT", name: "RUSSELL 2000", price: 2217.90, change: 18.40, changePercent: 0.84 },
  { symbol: "BTC-USD", name: "BITCOIN", price: 62480.00, change: 1240.50, changePercent: 2.02 },
];

export function generateHistoricalCandles(
  basePrice: number,
  timeframe: TimeframeOption
): Candle[] {
  let count = 50;
  let intervalMs = 24 * 60 * 60 * 1000; // 1 day
  let volatility = 0.015;

  switch (timeframe) {
    case "1D":
      count = 48; // 5-minute ticks over 4 hours
      intervalMs = 5 * 60 * 1000;
      volatility = 0.003;
      break;
    case "5D":
      count = 60; // 15-minute ticks over 5 days
      intervalMs = 30 * 60 * 1000;
      volatility = 0.007;
      break;
    case "1M":
      count = 30; // 30 days
      intervalMs = 24 * 60 * 60 * 1000;
      volatility = 0.016;
      break;
    case "6M":
      count = 80;
      intervalMs = 2 * 24 * 60 * 60 * 1000;
      volatility = 0.018;
      break;
    case "1Y":
      count = 120;
      intervalMs = 3 * 24 * 60 * 60 * 1000;
      volatility = 0.022;
      break;
    case "5Y":
      count = 160;
      intervalMs = 12 * 24 * 60 * 60 * 1000;
      volatility = 0.025;
      break;
  }

  const candles: Candle[] = [];
  const now = Date.now();
  let currentPrice = basePrice * (1 - volatility * Math.sqrt(count) * 0.4);

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - 1 - i) * intervalMs;
    const dateObj = new Date(timestamp);
    
    let dateStr = "";
    if (timeframe === "1D" || timeframe === "5D") {
      dateStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      dateStr = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
    }

    // Brownian motion tick
    const deltaPercent = (Math.random() - 0.485) * volatility;
    const open = currentPrice;
    const close = Math.max(1, Number((open * (1 + deltaPercent)).toFixed(2)));
    const candleHighDelta = Math.abs(Math.random() * volatility * open * 1.2);
    const candleLowDelta = Math.abs(Math.random() * volatility * open * 1.2);
    const high = Math.max(open, close) + candleHighDelta;
    const low = Math.min(open, close) - candleLowDelta;
    const volume = Math.floor(Math.random() * 400000 + 80000);

    candles.push({
      date: dateStr,
      timestamp,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    currentPrice = close;
  }

  // Ensure last candle close aligns smoothly with current basePrice
  const lastIndex = candles.length - 1;
  candles[lastIndex].close = Number(basePrice.toFixed(2));
  candles[lastIndex].high = Math.max(candles[lastIndex].high, basePrice);
  candles[lastIndex].low = Math.min(candles[lastIndex].low, basePrice);

  return enrichCandlesWithIndicators(candles);
}

export function generateOrderBook(currentPrice: number): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];

  let cumBid = 0;
  for (let i = 1; i <= 6; i++) {
    const price = Number((currentPrice - i * 0.05).toFixed(2));
    const size = Math.floor(Math.random() * 450 + 50);
    cumBid += size;
    bids.push({ price, size, total: cumBid });
  }

  let cumAsk = 0;
  for (let i = 1; i <= 6; i++) {
    const price = Number((currentPrice + i * 0.05).toFixed(2));
    const size = Math.floor(Math.random() * 450 + 50);
    cumAsk += size;
    asks.push({ price, size, total: cumAsk });
  }

  return { bids, asks };
}

export function generateInitialTrades(currentPrice: number): TradeTape[] {
  const trades: TradeTape[] = [];
  const now = Date.now();
  for (let i = 0; i < 8; i++) {
    const isBuy = Math.random() > 0.48;
    const price = Number((currentPrice + (Math.random() - 0.5) * 0.15).toFixed(2));
    const size = Math.floor(Math.random() * 250 + 10);
    const time = new Date(now - i * 3500).toLocaleTimeString();
    trades.push({
      id: `trade-${i}-${now}`,
      time,
      price,
      size,
      side: isBuy ? "BUY" : "SELL",
    });
  }
  return trades;
}
