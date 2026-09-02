import React, { useEffect, useRef, useState } from "react";
import {
  Candle,
  TimeframeOption,
  ChartTypeOption,
  ActiveIndicators,
} from "../types";
import {
  CandlestickChart,
  LineChart,
  SlidersHorizontal,
  Maximize2,
  Info,
} from "lucide-react";

interface InteractiveChartProps {
  candles: Candle[];
  timeframe: TimeframeOption;
  onChangeTimeframe: (tf: TimeframeOption) => void;
  chartType: ChartTypeOption;
  onChangeChartType: (ct: ChartTypeOption) => void;
  indicators: ActiveIndicators;
  onToggleIndicator: (key: keyof ActiveIndicators) => void;
  symbol: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  timeframe,
  onChangeTimeframe,
  chartType,
  onChangeChartType,
  indicators,
  onToggleIndicator,
  symbol,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Timeframe list
  const timeframes: TimeframeOption[] = ["1D", "5D", "1M", "6M", "1Y", "5Y"];

  // Draw chart onto canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    // Calculate layout heights for subplots
    const paddingRight = 65; // Price scale margin
    const paddingBottom = 26; // Time scale margin
    const chartWidth = width - paddingRight;
    const availableHeight = height - paddingBottom;

    // Count how many subplots are active
    let activeSubplots = 0;
    if (indicators.volume) activeSubplots += 1;
    if (indicators.rsi) activeSubplots += 1;
    if (indicators.macd) activeSubplots += 1;

    // Subplot heights
    const subHeight = activeSubplots > 0 ? Math.min(85, availableHeight * 0.18) : 0;
    const mainHeight = availableHeight - activeSubplots * subHeight;

    // 1. Calculate price bounds for main chart
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    candles.forEach((c) => {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
      if (indicators.bollingerBands) {
        if (c.bbLower !== undefined) minPrice = Math.min(minPrice, c.bbLower);
        if (c.bbUpper !== undefined) maxPrice = Math.max(maxPrice, c.bbUpper);
      }
      if (indicators.sma20 && c.sma20 !== undefined) {
        minPrice = Math.min(minPrice, c.sma20);
        maxPrice = Math.max(maxPrice, c.sma20);
      }
      if (indicators.sma50 && c.sma50 !== undefined) {
        minPrice = Math.min(minPrice, c.sma50);
        maxPrice = Math.max(maxPrice, c.sma50);
      }
    });

    // Add 4% headroom
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.04;
    maxPrice += priceRange * 0.04;
    const adjustedRange = maxPrice - minPrice;

    // Helper functions for coordinates
    const getX = (index: number) => {
      const step = chartWidth / Math.max(1, candles.length);
      return index * step + step / 2;
    };

    const getY = (price: number) => {
      return mainHeight - ((price - minPrice) / adjustedRange) * (mainHeight - 20) - 10;
    };

    // Draw Grid Lines (Horizontal price lines)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    const numPriceSteps = 5;
    for (let i = 0; i <= numPriceSteps; i++) {
      const priceVal = minPrice + (adjustedRange * i) / numPriceSteps;
      const y = getY(priceVal);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Right Axis Label
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`$${priceVal.toFixed(2)}`, chartWidth + 6, y + 3);
    }

    // Draw Bollinger Bands Shading & Lines
    if (indicators.bollingerBands) {
      // Shaded band
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candles.length; i++) {
        const up = candles[i].bbUpper;
        if (up !== undefined) {
          const x = getX(i);
          const y = getY(up);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = candles.length - 1; i >= 0; i--) {
        const low = candles[i].bbLower;
        if (low !== undefined) {
          const x = getX(i);
          const y = getY(low);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 255, 0, 0.04)";
      ctx.fill();

      // Upper & Lower line
      const drawBandLine = (accessor: (c: Candle) => number | undefined, color: string) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        let active = false;
        candles.forEach((c, idx) => {
          const val = accessor(c);
          if (val !== undefined) {
            const x = getX(idx);
            const y = getY(val);
            if (!active) {
              ctx.moveTo(x, y);
              active = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        });
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawBandLine((c) => c.bbUpper, "rgba(0, 255, 0, 0.4)");
      drawBandLine((c) => c.bbLower, "rgba(0, 255, 0, 0.4)");
      drawBandLine((c) => c.bbMiddle, "rgba(255, 255, 255, 0.6)");
    }

    // Draw Moving Averages
    const drawLineIndicator = (accessor: (c: Candle) => number | undefined, color: string, widthPx: number = 1.5) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      let active = false;
      candles.forEach((c, idx) => {
        const val = accessor(c);
        if (val !== undefined) {
          const x = getX(idx);
          const y = getY(val);
          if (!active) {
            ctx.moveTo(x, y);
            active = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
    };

    if (indicators.sma20) drawLineIndicator((c) => c.sma20, "#00FF00", 1.5);
    if (indicators.sma50) drawLineIndicator((c) => c.sma50, "#ffffff", 1.5);
    if (indicators.ema) {
      drawLineIndicator((c) => c.ema12, "#00e5ff", 1.2);
      drawLineIndicator((c) => c.ema26, "#ff007f", 1.2);
    }

    // 2. Draw Main Price Data (Candles or Area Chart)
    const candleWidth = Math.max(2, (chartWidth / candles.length) * 0.72);

    if (chartType === "CANDLESTICK") {
      candles.forEach((c, idx) => {
        const x = getX(idx);
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        const isBullish = c.close >= c.open;
        const color = isBullish ? "#00FF00" : "#FF3B3B";

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle Body
        const top = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyHeight);
      });
    } else {
      // Area / Line chart with glow
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Area gradient
      const lastX = getX(candles.length - 1);
      const firstX = getX(0);
      ctx.lineTo(lastX, mainHeight);
      ctx.lineTo(firstX, mainHeight);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, mainHeight);
      grad.addColorStop(0, "rgba(0, 255, 0, 0.25)");
      grad.addColorStop(1, "rgba(0, 255, 0, 0.0)");
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Current price horizontal line marker on right axis
    const latestCandle = candles[candles.length - 1];
    if (latestCandle) {
      const currentY = getY(latestCandle.close);
      const isUp = latestCandle.close >= latestCandle.open;
      const markerColor = isUp ? "#00FF00" : "#FF3B3B";

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = markerColor;
      ctx.moveTo(0, currentY);
      ctx.lineTo(chartWidth, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Badge on right axis
      ctx.fillStyle = markerColor;
      ctx.fillRect(chartWidth + 2, currentY - 9, paddingRight - 4, 18);
      ctx.fillStyle = isUp ? "#000000" : "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`$${latestCandle.close.toFixed(2)}`, chartWidth + 6, currentY + 3.5);
    }

    // 3. Subplots rendering
    let currentSubplotY = mainHeight;

    // Subplot: Volume
    if (indicators.volume) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentSubplotY);
      ctx.lineTo(width, currentSubplotY);
      ctx.stroke();

      // Volume Title
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText("VOLUME", 8, currentSubplotY + 14);

      let maxVol = 0;
      candles.forEach((c) => {
        maxVol = Math.max(maxVol, c.volume);
      });
      maxVol = maxVol || 1;

      candles.forEach((c, idx) => {
        const x = getX(idx);
        const barH = (c.volume / maxVol) * (subHeight - 20);
        const y = currentSubplotY + subHeight - barH - 4;
        const color = c.close >= c.open ? "rgba(0, 255, 0, 0.6)" : "rgba(255, 59, 59, 0.6)";
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, y, candleWidth, barH);
      });

      currentSubplotY += subHeight;
    }

    // Subplot: RSI
    if (indicators.rsi) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentSubplotY);
      ctx.lineTo(width, currentSubplotY);
      ctx.stroke();

      // RSI Label & Value
      const latestRSI = latestCandle?.rsi ?? 50;
      ctx.fillStyle = "#00FF00";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`RSI (14): ${latestRSI.toFixed(1)}`, 8, currentSubplotY + 14);

      const rsiToY = (val: number) => {
        return currentSubplotY + subHeight - 8 - (val / 100) * (subHeight - 24);
      };

      // 70 and 30 Overbought/Oversold lines
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "rgba(255, 59, 59, 0.5)";
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(70));
      ctx.lineTo(chartWidth, rsiToY(70));
      ctx.stroke();

      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
      ctx.beginPath();
      ctx.moveTo(0, rsiToY(30));
      ctx.lineTo(chartWidth, rsiToY(30));
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Curve
      ctx.beginPath();
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 1.5;
      let rsiActive = false;
      candles.forEach((c, idx) => {
        if (c.rsi !== undefined) {
          const x = getX(idx);
          const y = rsiToY(c.rsi);
          if (!rsiActive) {
            ctx.moveTo(x, y);
            rsiActive = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();

      // RSI 70/30 Right labels
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "bold 9px monospace";
      ctx.fillText("70", chartWidth + 6, rsiToY(70) + 3);
      ctx.fillText("30", chartWidth + 6, rsiToY(30) + 3);

      currentSubplotY += subHeight;
    }

    // Subplot: MACD
    if (indicators.macd) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentSubplotY);
      ctx.lineTo(width, currentSubplotY);
      ctx.stroke();

      const latestMacd = latestCandle?.macd ?? 0;
      const latestSig = latestCandle?.macdSignal ?? 0;
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`MACD: ${latestMacd.toFixed(2)}  Signal: ${latestSig.toFixed(2)}`, 8, currentSubplotY + 14);

      let maxMacdRange = 0.5;
      candles.forEach((c) => {
        if (c.macd !== undefined) maxMacdRange = Math.max(maxMacdRange, Math.abs(c.macd));
        if (c.macdHist !== undefined) maxMacdRange = Math.max(maxMacdRange, Math.abs(c.macdHist));
      });

      const zeroY = currentSubplotY + subHeight / 2;
      const macdScale = (subHeight / 2 - 12) / maxMacdRange;

      // Zero line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(chartWidth, zeroY);
      ctx.stroke();

      // Histogram
      candles.forEach((c, idx) => {
        if (c.macdHist !== undefined) {
          const x = getX(idx);
          const barH = c.macdHist * macdScale;
          const isPos = c.macdHist >= 0;
          ctx.fillStyle = isPos ? "#00FF00" : "#FF3B3B";
          ctx.fillRect(x - candleWidth / 2, zeroY - barH, candleWidth, barH);
        }
      });

      // MACD Line
      ctx.beginPath();
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 1.3;
      candles.forEach((c, idx) => {
        if (c.macd !== undefined) {
          const x = getX(idx);
          const y = zeroY - c.macd * macdScale;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Signal Line
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.3;
      candles.forEach((c, idx) => {
        if (c.macdSignal !== undefined) {
          const x = getX(idx);
          const y = zeroY - c.macdSignal * macdScale;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      currentSubplotY += subHeight;
    }

    // 4. Time Axis Labels on Bottom
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(0, availableHeight);
    ctx.lineTo(width, availableHeight);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";

    const labelInterval = Math.max(1, Math.floor(candles.length / 6));
    candles.forEach((c, idx) => {
      if (idx % labelInterval === 0 || idx === candles.length - 1) {
        const x = getX(idx);
        ctx.fillText(c.date, x, height - 8);
      }
    });

    // 5. Interactive Crosshair & Tooltip
    if (mousePos && hoverIndex !== null && hoverIndex >= 0 && hoverIndex < candles.length) {
      const activeCandle = candles[hoverIndex];
      const activeX = getX(hoverIndex);
      const activeY = getY(activeCandle.close);

      // Crosshair lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.setLineDash([4, 4]);

      // Vertical line across full height
      ctx.beginPath();
      ctx.moveTo(activeX, 0);
      ctx.lineTo(activeX, availableHeight);
      ctx.stroke();

      // Horizontal line on main chart
      if (mousePos.y <= mainHeight) {
        ctx.beginPath();
        ctx.moveTo(0, mousePos.y);
        ctx.lineTo(chartWidth, mousePos.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Point circle on candle close
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(activeX, activeY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [candles, chartType, indicators, mousePos, hoverIndex]);

  // Handle Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingRight = 65;
    const chartWidth = rect.width - paddingRight;

    if (x >= 0 && x <= chartWidth) {
      const step = chartWidth / candles.length;
      const index = Math.min(candles.length - 1, Math.max(0, Math.floor(x / step)));
      setHoverIndex(index);
      setMousePos({ x, y });
    } else {
      setHoverIndex(null);
      setMousePos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  const inspectedCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1];

  return (
    <div className="w-full bg-[#050505] border-b border-white/10 flex flex-col select-none">
      {/* Chart Control Toolbar */}
      <div className="px-6 py-3 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left: Timeframe & Chart Type */}
        <div className="flex items-center gap-3">
          {/* Timeframe Buttons */}
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded p-0.5 gap-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf}
                id={`btn-timeframe-${tf}`}
                onClick={() => onChangeTimeframe(tf)}
                className={`px-3 py-1 rounded text-[11px] font-mono transition-colors uppercase ${
                  timeframe === tf
                    ? "bg-white text-black font-black"
                    : "text-white/40 hover:text-white font-bold"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Candlestick vs Area toggle */}
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded p-0.5">
            <button
              id="btn-chart-candlestick"
              onClick={() => onChangeChartType("CANDLESTICK")}
              title="Candlestick Chart"
              className={`p-1.5 rounded transition-colors ${
                chartType === "CANDLESTICK" ? "bg-white/10 text-[#00FF00]" : "text-white/40 hover:text-white"
              }`}
            >
              <CandlestickChart className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-chart-area"
              onClick={() => onChangeChartType("AREA")}
              title="Line / Area Chart"
              className={`p-1.5 rounded transition-colors ${
                chartType === "AREA" ? "bg-white/10 text-[#00FF00]" : "text-white/40 hover:text-white"
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Technical Indicator Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-white/30 font-black mr-1 uppercase tracking-[0.2em] flex items-center gap-1.5">
            <SlidersHorizontal className="w-3 h-3 text-[#00FF00]" /> Overlays:
          </span>

          <button
            id="toggle-bb"
            onClick={() => onToggleIndicator("bollingerBands")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.bollingerBands
                ? "bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            BB (20,2)
          </button>

          <button
            id="toggle-sma20"
            onClick={() => onToggleIndicator("sma20")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.sma20
                ? "bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            SMA 20
          </button>

          <button
            id="toggle-sma50"
            onClick={() => onToggleIndicator("sma50")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.sma50
                ? "bg-white/20 text-white border-white/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            SMA 50
          </button>

          <button
            id="toggle-ema"
            onClick={() => onToggleIndicator("ema")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.ema
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            EMA 12/26
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <button
            id="toggle-vol"
            onClick={() => onToggleIndicator("volume")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.volume
                ? "bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            VOL
          </button>

          <button
            id="toggle-rsi"
            onClick={() => onToggleIndicator("rsi")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.rsi
                ? "bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            RSI (14)
          </button>

          <button
            id="toggle-macd"
            onClick={() => onToggleIndicator("macd")}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider transition-colors border uppercase ${
              indicators.macd
                ? "bg-white/20 text-white border-white/40 font-black"
                : "bg-white/[0.02] text-white/40 border-white/10 hover:text-white font-bold"
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* Floating Info / OHLC Crosshair Bar */}
      {inspectedCandle && (
        <div className="px-6 py-2 bg-[#080808] border-b border-white/10 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs font-mono">
          <span className="text-white/40 font-bold">{inspectedCandle.date}</span>
          <span className="text-white/40">
            O: <strong className="text-white">${inspectedCandle.open.toFixed(2)}</strong>
          </span>
          <span className="text-white/40">
            H: <strong className="text-white">${inspectedCandle.high.toFixed(2)}</strong>
          </span>
          <span className="text-white/40">
            L: <strong className="text-white">${inspectedCandle.low.toFixed(2)}</strong>
          </span>
          <span className="text-white/40">
            C:{" "}
            <strong
              className={inspectedCandle.close >= inspectedCandle.open ? "text-[#00FF00]" : "text-[#FF3B3B]"}
            >
              ${inspectedCandle.close.toFixed(2)}
            </strong>
          </span>
          {indicators.volume && (
            <span className="text-white/40">
              VOL: <strong className="text-white">{(inspectedCandle.volume / 1_000_000).toFixed(2)}M</strong>
            </span>
          )}
          {indicators.rsi && inspectedCandle.rsi !== undefined && (
            <span className="text-[#00FF00]">
              RSI: <strong>{inspectedCandle.rsi.toFixed(1)}</strong>
            </span>
          )}
          {indicators.sma20 && inspectedCandle.sma20 !== undefined && (
            <span className="text-white/70">
              SMA20: <strong>${inspectedCandle.sma20.toFixed(2)}</strong>
            </span>
          )}
          {indicators.bollingerBands && inspectedCandle.bbUpper !== undefined && (
            <span className="text-[#00FF00]/80">
              BB: [<strong>${inspectedCandle.bbLower?.toFixed(1)}</strong> -{" "}
              <strong>${inspectedCandle.bbUpper?.toFixed(1)}</strong>]
            </span>
          )}
        </div>
      )}

      {/* Canvas Chart Area */}
      <div ref={containerRef} className="relative w-full h-[460px] sm:h-[520px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
