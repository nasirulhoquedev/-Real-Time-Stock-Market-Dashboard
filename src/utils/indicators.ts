import { Candle, TechnicalSignals } from "../types";

export function calculateSMA(data: number[], window: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(undefined);
    } else {
      let sum = 0;
      for (let j = 0; j < window; j++) {
        sum += data[i - j];
      }
      result.push(sum / window);
    }
  }
  return result;
}

export function calculateEMA(data: number[], span: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const multiplier = 2 / (span + 1);
  let previousEMA: number | undefined = undefined;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      previousEMA = data[i];
      result.push(previousEMA);
    } else {
      const currentEMA = (data[i] - (previousEMA ?? data[i])) * multiplier + (previousEMA ?? data[i]);
      previousEMA = currentEMA;
      result.push(currentEMA);
    }
  }
  return result;
}

export function calculateRSI(data: number[], window: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  if (data.length < window + 1) {
    return data.map(() => 50);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= window; i++) {
    const change = data[i] - data[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / window;
  let avgLoss = losses / window;

  for (let i = 0; i < window; i++) {
    result.push(undefined);
  }

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(100 - 100 / (1 + rs));

  for (let i = window + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (window - 1) + gain) / window;
    avgLoss = (avgLoss * (window - 1) + loss) / window;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  return result;
}

export function calculateMACD(
  data: number[],
  fast: number = 12,
  slow: number = 26,
  signalSpan: number = 9
): {
  macd: (number | undefined)[];
  signal: (number | undefined)[];
  hist: (number | undefined)[];
} {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);

  const macdLine: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    const f = emaFast[i];
    const s = emaSlow[i];
    if (f !== undefined && s !== undefined) {
      macdLine.push(f - s);
    } else {
      macdLine.push(undefined);
    }
  }

  const validMacdValues = macdLine.map((v) => (v !== undefined ? v : 0));
  const signalLine = calculateEMA(validMacdValues, signalSpan);

  const hist: (number | undefined)[] = [];
  for (let i = 0; i < data.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m !== undefined && s !== undefined) {
      hist.push(m - s);
    } else {
      hist.push(undefined);
    }
  }

  return { macd: macdLine, signal: signalLine, hist };
}

export function calculateBollingerBands(
  data: number[],
  window: number = 20,
  numStd: number = 2.0
): {
  upper: (number | undefined)[];
  middle: (number | undefined)[];
  lower: (number | undefined)[];
} {
  const middle = calculateSMA(data, window);
  const upper: (number | undefined)[] = [];
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < data.length; i++) {
    const mid = middle[i];
    if (mid === undefined || i < window - 1) {
      upper.push(undefined);
      lower.push(undefined);
    } else {
      let sumSq = 0;
      for (let j = 0; j < window; j++) {
        sumSq += Math.pow(data[i - j] - mid, 2);
      }
      const std = Math.sqrt(sumSq / window);
      upper.push(mid + std * numStd);
      lower.push(mid - std * numStd);
    }
  }

  return { upper, middle, lower };
}

export function enrichCandlesWithIndicators(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];
  const closes = candles.map((c) => c.close);

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const rsi = calculateRSI(closes, 14);
  const { macd, signal, hist } = calculateMACD(closes, 12, 26, 9);
  const { upper, middle, lower } = calculateBollingerBands(closes, 20, 2.0);

  return candles.map((candle, idx) => ({
    ...candle,
    sma20: sma20[idx],
    sma50: sma50[idx],
    ema12: ema12[idx],
    ema26: ema26[idx],
    bbUpper: upper[idx],
    bbMiddle: middle[idx],
    bbLower: lower[idx],
    rsi: rsi[idx] ?? 50,
    macd: macd[idx] ?? 0,
    macdSignal: signal[idx] ?? 0,
    macdHist: hist[idx] ?? 0,
  }));
}

export function evaluateTechnicalSignals(candle: Candle): TechnicalSignals {
  const rsi = candle.rsi ?? 50;
  const macd = candle.macd ?? 0;
  const macdSignal = candle.macdSignal ?? 0;
  const macdHist = candle.macdHist ?? 0;
  const sma20 = candle.sma20 ?? candle.close;
  const sma50 = candle.sma50 ?? candle.close;
  const bbUpper = candle.bbUpper ?? candle.close * 1.05;
  const bbLower = candle.bbLower ?? candle.close * 0.95;
  const bbMiddle = candle.bbMiddle ?? candle.close;

  // RSI signal
  let rsiSignal: "OVERSOLD" | "NEUTRAL" | "OVERBOUGHT" = "NEUTRAL";
  let rsiAction = "Neutral consolidation";
  if (rsi >= 70) {
    rsiSignal = "OVERBOUGHT";
    rsiAction = "Overbought zone (Bearish reversal risk)";
  } else if (rsi <= 30) {
    rsiSignal = "OVERSOLD";
    rsiAction = "Oversold territory (Potential bullish bounce)";
  }

  // MACD signal
  const macdTrend: "BULLISH" | "BEARISH" = macdHist >= 0 ? "BULLISH" : "BEARISH";
  const macdAction =
    macdHist >= 0
      ? macd >= macdSignal
        ? "Bullish histogram expanding"
        : "Bullish convergence"
      : "Bearish divergence";

  // Moving averages
  const crossStatus: "GOLDEN_CROSS" | "DEATH_CROSS" | "NEUTRAL" =
    sma20 > sma50 ? "GOLDEN_CROSS" : sma20 < sma50 ? "DEATH_CROSS" : "NEUTRAL";
  const priceVsSma: "ABOVE" | "BELOW" = candle.close >= sma20 ? "ABOVE" : "BELOW";

  // Bollinger Bands position
  let bbPosition: "UPPER_BAND" | "MIDDLE_BAND" | "LOWER_BAND" | "BAND_SQUEEZE" = "MIDDLE_BAND";
  const bandwidth = (bbUpper - bbLower) / bbMiddle;
  if (bandwidth < 0.04) {
    bbPosition = "BAND_SQUEEZE";
  } else if (candle.close >= bbUpper * 0.98) {
    bbPosition = "UPPER_BAND";
  } else if (candle.close <= bbLower * 1.02) {
    bbPosition = "LOWER_BAND";
  }

  // Calculate composite score
  let score = 0;
  if (rsi < 35) score += 2;
  else if (rsi < 50) score += 1;
  else if (rsi > 70) score -= 2;
  else if (rsi > 60) score -= 0.5;

  if (macdTrend === "BULLISH") score += 1.5;
  else score -= 1.5;

  if (priceVsSma === "ABOVE") score += 1;
  else score -= 1;

  if (crossStatus === "GOLDEN_CROSS") score += 1;
  else if (crossStatus === "DEATH_CROSS") score -= 1;

  let overallRating: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL" = "NEUTRAL";
  if (score >= 3.5) overallRating = "STRONG_BUY";
  else if (score >= 1.5) overallRating = "BUY";
  else if (score <= -3.5) overallRating = "STRONG_SELL";
  else if (score <= -1.5) overallRating = "SELL";

  return {
    overallRating,
    rsiScore: {
      value: Number(rsi.toFixed(1)),
      signal: rsiSignal,
      action: rsiAction,
    },
    macdScore: {
      macd: Number(macd.toFixed(2)),
      signal: Number(macdSignal.toFixed(2)),
      histogram: Number(macdHist.toFixed(2)),
      trend: macdTrend,
      action: macdAction,
    },
    movingAverages: {
      sma20: Number(sma20.toFixed(2)),
      sma50: Number(sma50.toFixed(2)),
      crossStatus,
      priceVsSma,
    },
    bollingerBands: {
      upper: Number(bbUpper.toFixed(2)),
      middle: Number(bbMiddle.toFixed(2)),
      lower: Number(bbLower.toFixed(2)),
      position: bbPosition,
    },
  };
}
