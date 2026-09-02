"""
Real-Time Stock Market Dashboard
Technologies: Python (Pandas, Plotly, Requests API), Streamlit
"""

import time
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from data_fetcher import fetch_stock_data_requests, get_realtime_quote, POPULAR_STOCKS
from indicators import add_all_indicators

# Page Configuration
st.set_page_config(
    page_title="Real-Time Stock Market Dashboard",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling
st.markdown(
    """
    <style>
    .metric-card {
        background-color: #1e222d;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #2a2e39;
        margin-bottom: 12px;
    }
    .metric-title {
        color: #787b86;
        font-size: 13px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .metric-value {
        font-size: 26px;
        font-weight: 700;
        color: #d1d4dc;
    }
    .bullish { color: #089981 !important; }
    .bearish { color: #f23645 !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ----------------- SIDEBAR CONTROLS -----------------
st.sidebar.title("📈 Market Terminal")
st.sidebar.caption("Python • Pandas • Plotly • Streamlit")

# Stock Selector
stock_options = list(POPULAR_STOCKS.keys())
selected_stock = st.sidebar.selectbox(
    "Select Stock Ticker",
    options=stock_options,
    index=0,
)

custom_ticker = st.sidebar.text_input("Or Enter Custom Symbol", "").upper().strip()
ticker = custom_ticker if custom_ticker else selected_stock

# Timeframe Selector
timeframe = st.sidebar.select_slider(
    "Select Timeframe",
    options=["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"],
    value="1mo",
)

interval_map = {
    "1d": "5m",
    "5d": "15m",
    "1mo": "1d",
    "3mo": "1d",
    "6mo": "1d",
    "1y": "1wk",
    "5y": "1mo",
}
interval = interval_map.get(timeframe, "1d")

st.sidebar.markdown("---")
st.sidebar.subheader("Technical Overlays")
show_bb = st.sidebar.checkbox("Bollinger Bands (20, 2)", value=True)
show_sma20 = st.sidebar.checkbox("SMA 20 (Simple Moving Avg)", value=True)
show_sma50 = st.sidebar.checkbox("SMA 50", value=False)
show_ema = st.sidebar.checkbox("EMA 12 & EMA 26", value=False)

st.sidebar.markdown("---")
st.sidebar.subheader("Sub-Charts & Oscillators")
show_rsi = st.sidebar.checkbox("RSI (Relative Strength Index - 14)", value=True)
show_macd = st.sidebar.checkbox("MACD (12, 26, 9)", value=True)
show_volume = st.sidebar.checkbox("Volume Bar Chart", value=True)

st.sidebar.markdown("---")
auto_refresh = st.sidebar.checkbox("Live Real-Time Auto Refresh", value=False)
refresh_rate = st.sidebar.slider("Refresh Interval (sec)", min_value=2, max_value=30, value=5)

# ----------------- DATA PIPELINE -----------------
with st.spinner(f"Fetching market data for {ticker}..."):
    raw_df = fetch_stock_data_requests(ticker, period=timeframe, interval=interval)
    df = add_all_indicators(raw_df)
    quote = get_realtime_quote(ticker, last_close=float(df["Close"].iloc[-1]) if not df.empty else 150.0)

# ----------------- HEADER & LIVE METRICS -----------------
col_head1, col_head2 = st.columns([3, 1])
with col_head1:
    st.title(f"{ticker} • {quote['name']}")
    st.caption(f"Real-Time Exchange Data • Last updated: {quote['timestamp']}")

with col_head2:
    is_positive = quote["change"] >= 0
    delta_color = "normal" if is_positive else "inverse"
    st.metric(
        label="Current Market Price",
        value=f"${quote['price']:,.2f}",
        delta=f"{'+' if is_positive else ''}{quote['change']:,.2f} ({quote['change_pct']:+.2f}%)",
        delta_color=delta_color,
    )

# Summary Cards Row
m_col1, m_col2, m_col3, m_col4, m_col5 = st.columns(5)
with m_col1:
    st.metric("Day High", f"${df['High'].max():,.2f}")
with m_col2:
    st.metric("Day Low", f"${df['Low'].min():,.2f}")
with m_col3:
    st.metric("Market Cap", quote["market_cap"])
with m_col4:
    st.metric("P/E Ratio", f"{quote['pe_ratio']}")
with m_col5:
    latest_rsi = df["RSI_14"].iloc[-1]
    rsi_status = "Overbought (>70)" if latest_rsi > 70 else "Oversold (<30)" if latest_rsi < 30 else "Neutral"
    st.metric("RSI (14)", f"{latest_rsi:.1f}", delta=rsi_status)

# ----------------- PLOTLY INTERACTIVE CHART -----------------
# Determine number of subplots needed
row_heights = [0.55]
subplot_titles = [f"{ticker} Price Action & Indicators"]

if show_volume:
    row_heights.append(0.15)
    subplot_titles.append("Trading Volume")
if show_rsi:
    row_heights.append(0.15)
    subplot_titles.append("RSI (14)")
if show_macd:
    row_heights.append(0.15)
    subplot_titles.append("MACD (12, 26, 9)")

# Normalize row heights
total_h = sum(row_heights)
row_heights = [h / total_h for h in row_heights]

fig = make_subplots(
    rows=len(row_heights),
    cols=1,
    shared_xaxes=True,
    vertical_spacing=0.03,
    subplot_titles=subplot_titles,
    row_heights=row_heights,
)

# 1. Main Candlestick Chart
candlestick = go.Candlestick(
    x=df["Date"],
    open=df["Open"],
    high=df["High"],
    low=df["Low"],
    close=df["Close"],
    name="OHLC",
    increasing_line_color="#089981",
    decreasing_line_color="#f23645",
)
fig.add_trace(candlestick, row=1, col=1)

# Overlays
if show_bb:
    fig.add_trace(
        go.Scatter(
            x=df["Date"],
            y=df["BB_Upper"],
            line=dict(color="rgba(41, 98, 255, 0.4)", width=1, dash="dash"),
            name="BB Upper (20, 2)",
        ),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Scatter(
            x=df["Date"],
            y=df["BB_Lower"],
            line=dict(color="rgba(41, 98, 255, 0.4)", width=1, dash="dash"),
            fill="tonexty",
            fillcolor="rgba(41, 98, 255, 0.05)",
            name="BB Lower (20, 2)",
        ),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Scatter(
            x=df["Date"],
            y=df["BB_Middle"],
            line=dict(color="rgba(255, 152, 0, 0.7)", width=1),
            name="BB Basis (20)",
        ),
        row=1,
        col=1,
    )

if show_sma20:
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["SMA_20"], line=dict(color="#2962ff", width=1.5), name="SMA 20"),
        row=1,
        col=1,
    )

if show_sma50:
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["SMA_50"], line=dict(color="#9c27b0", width=1.5), name="SMA 50"),
        row=1,
        col=1,
    )

if show_ema:
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["EMA_12"], line=dict(color="#00bcd4", width=1.2), name="EMA 12"),
        row=1,
        col=1,
    )
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["EMA_26"], line=dict(color="#e91e63", width=1.2), name="EMA 26"),
        row=1,
        col=1,
    )

# Current row tracker for dynamic subplots
curr_row = 2

# 2. Volume Bar Chart
if show_volume:
    vol_colors = [
        "#089981" if c >= o else "#f23645"
        for c, o in zip(df["Close"], df["Open"])
    ]
    fig.add_trace(
        go.Bar(x=df["Date"], y=df["Volume"], marker_color=vol_colors, name="Volume", showlegend=False),
        row=curr_row,
        col=1,
    )
    curr_row += 1

# 3. RSI Chart
if show_rsi:
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["RSI_14"], line=dict(color="#e040fb", width=1.8), name="RSI (14)"),
        row=curr_row,
        col=1,
    )
    # Overbought (70) and Oversold (30) reference lines
    fig.add_hline(y=70, line_dash="dash", line_color="rgba(242, 54, 69, 0.6)", row=curr_row, col=1)
    fig.add_hline(y=30, line_dash="dash", line_color="rgba(8, 153, 129, 0.6)", row=curr_row, col=1)
    curr_row += 1

# 4. MACD Chart
if show_macd:
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["MACD"], line=dict(color="#2962ff", width=1.5), name="MACD"),
        row=curr_row,
        col=1,
    )
    fig.add_trace(
        go.Scatter(x=df["Date"], y=df["MACD_Signal"], line=dict(color="#ff9800", width=1.5), name="Signal"),
        row=curr_row,
        col=1,
    )
    hist_colors = ["#089981" if h >= 0 else "#f23645" for h in df["MACD_Hist"]]
    fig.add_trace(
        go.Bar(x=df["Date"], y=df["MACD_Hist"], marker_color=hist_colors, name="Histogram"),
        row=curr_row,
        col=1,
    )

# Layout adjustments for modern dark financial terminal
fig.update_layout(
    height=820,
    margin=dict(l=40, r=40, t=40, b=40),
    template="plotly_dark",
    paper_bgcolor="#131722",
    plot_bgcolor="#131722",
    legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    xaxis_rangeslider_visible=False,
)
fig.update_xaxes(showgrid=True, gridcolor="#2a2e39")
fig.update_yaxes(showgrid=True, gridcolor="#2a2e39")

st.plotly_chart(fig, use_container_width=True)

# ----------------- TECHNICAL SIGNALS & DATA TABLE -----------------
col_sig, col_tbl = st.columns([1, 2])

with col_sig:
    st.subheader("Technical Indicator Signals")
    latest_close = df["Close"].iloc[-1]
    sma20_val = df["SMA_20"].iloc[-1]
    sma50_val = df["SMA_50"].iloc[-1]
    macd_val = df["MACD"].iloc[-1]
    macd_sig = df["MACD_Signal"].iloc[-1]

    # Analysis calculations
    trend_sma = "BULLISH" if latest_close > sma20_val else "BEARISH"
    trend_cross = "GOLDEN CROSS" if sma20_val > sma50_val else "DEATH CROSS"
    macd_bias = "BULLISH MOMENTUM" if macd_val > macd_sig else "BEARISH MOMENTUM"
    
    st.info(f"**Price vs SMA 20**: {trend_sma} (${latest_close:.2f} vs ${sma20_val:.2f})")
    st.info(f"**MACD Signal**: {macd_bias}")
    st.info(f"**RSI Momentum**: {rsi_status} ({latest_rsi:.1f})")

with col_tbl:
    st.subheader("Recent Historical Data (Pandas DataFrame)")
    display_df = df[["Date", "Open", "High", "Low", "Close", "Volume", "RSI_14", "SMA_20"]].tail(10)
    st.dataframe(display_df, use_container_width=True)

# ----------------- LIVE REFRESH LOOP -----------------
if auto_refresh:
    time.sleep(refresh_rate)
    st.rerun()
