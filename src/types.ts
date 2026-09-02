export interface Candle {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
  ema12?: number;
  ema26?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: string;
  marketCap: string;
  peRatio: number;
  week52High: number;
  week52Low: number;
  beta: number;
  dividendYield: number;
  description: string;
  ceo: string;
  headquarters: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface TechnicalSignals {
  overallRating: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  rsiScore: {
    value: number;
    signal: "OVERSOLD" | "NEUTRAL" | "OVERBOUGHT";
    action: string;
  };
  macdScore: {
    macd: number;
    signal: number;
    histogram: number;
    trend: "BULLISH" | "BEARISH";
    action: string;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    crossStatus: "GOLDEN_CROSS" | "DEATH_CROSS" | "NEUTRAL";
    priceVsSma: "ABOVE" | "BELOW";
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    position: "UPPER_BAND" | "MIDDLE_BAND" | "LOWER_BAND" | "BAND_SQUEEZE";
  };
}

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

export interface TradeTape {
  id: string;
  time: string;
  price: number;
  size: number;
  side: "BUY" | "SELL";
}

export type TimeframeOption = "1D" | "5D" | "1M" | "6M" | "1Y" | "5Y";
export type ChartTypeOption = "CANDLESTICK" | "AREA";

export interface ActiveIndicators {
  bollingerBands: boolean;
  sma20: boolean;
  sma50: boolean;
  ema: boolean;
  volume: boolean;
  rsi: boolean;
  macd: boolean;
}
