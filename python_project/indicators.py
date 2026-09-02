"""
Technical Indicators Calculation Module
Technologies: Python, Pandas, NumPy
"""

import pandas as pd
import numpy as np


def calculate_sma(data: pd.Series, window: int = 20) -> pd.Series:
    """Calculate Simple Moving Average (SMA)."""
    return data.rolling(window=window).mean()


def calculate_ema(data: pd.Series, span: int = 20) -> pd.Series:
    """Calculate Exponential Moving Average (EMA)."""
    return data.ewm(span=span, adjust=False).mean()


def calculate_rsi(data: pd.Series, window: int = 14) -> pd.Series:
    """
    Calculate Relative Strength Index (RSI).
    RSI = 100 - (100 / (1 + RS))
    where RS = Average Gain / Average Loss over window
    """
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()

    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)


def calculate_macd(
    data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Calculate MACD (Moving Average Convergence Divergence),
    Signal line, and Histogram.
    """
    ema_fast = data.ewm(span=fast, adjust=False).mean()
    ema_slow = data.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    macd_hist = macd_line - signal_line
    return macd_line, signal_line, macd_hist


def calculate_bollinger_bands(
    data: pd.Series, window: int = 20, num_std: float = 2.0
) -> tuple[pd.Series, pd.Series, pd.Series]:
    """
    Calculate Bollinger Bands:
    Middle Band = 20-day SMA
    Upper Band = Middle Band + 2 * std
    Lower Band = Middle Band - 2 * std
    """
    middle_band = data.rolling(window=window).mean()
    rolling_std = data.rolling(window=window).std()
    upper_band = middle_band + (rolling_std * num_std)
    lower_band = middle_band - (rolling_std * num_std)
    return upper_band, middle_band, lower_band


def add_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Add all technical indicators to a copy of the given OHLCV DataFrame.
    Expects 'Close' column.
    """
    res = df.copy()
    close = res["Close"]

    # Moving Averages
    res["SMA_20"] = calculate_sma(close, window=20)
    res["SMA_50"] = calculate_sma(close, window=50)
    res["EMA_12"] = calculate_ema(close, span=12)
    res["EMA_26"] = calculate_ema(close, span=26)

    # RSI
    res["RSI_14"] = calculate_rsi(close, window=14)

    # MACD
    macd, signal, hist = calculate_macd(close, fast=12, slow=26, signal=9)
    res["MACD"] = macd
    res["MACD_Signal"] = signal
    res["MACD_Hist"] = hist

    # Bollinger Bands
    upper, mid, lower = calculate_bollinger_bands(close, window=20, num_std=2.0)
    res["BB_Upper"] = upper
    res["BB_Middle"] = mid
    res["BB_Lower"] = lower

    return res
