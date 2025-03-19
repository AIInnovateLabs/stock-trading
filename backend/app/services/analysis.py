import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta

def calculate_ma(prices: List[float], period: int) -> List[float]:
    """计算移动平均线"""
    return pd.Series(prices).rolling(window=period).mean().tolist()

def calculate_macd(prices: List[float], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> Dict[str, List[float]]:
    """计算MACD指标"""
    prices_series = pd.Series(prices)
    
    # 计算快速和慢速EMA
    fast_ema = prices_series.ewm(span=fast_period, adjust=False).mean()
    slow_ema = prices_series.ewm(span=slow_period, adjust=False).mean()
    
    # 计算MACD线
    macd_line = fast_ema - slow_ema
    
    # 计算信号线
    signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
    
    # 计算MACD柱状图
    macd_hist = macd_line - signal_line
    
    return {
        "macd_line": macd_line.tolist(),
        "signal_line": signal_line.tolist(),
        "macd_hist": macd_hist.tolist()
    }

def calculate_rsi(prices: List[float], period: int = 14) -> List[float]:
    """计算RSI指标"""
    prices_series = pd.Series(prices)
    
    # 计算价格变化
    delta = prices_series.diff()
    
    # 分别计算上涨和下跌
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    # 计算RS和RSI
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi.tolist()

def calculate_bollinger_bands(prices: List[float], period: int = 20, std_dev: int = 2) -> Dict[str, List[float]]:
    """计算布林带"""
    prices_series = pd.Series(prices)
    
    # 计算中轨（20日移动平均线）
    middle_band = prices_series.rolling(window=period).mean()
    
    # 计算标准差
    std = prices_series.rolling(window=period).std()
    
    # 计算上轨和下轨
    upper_band = middle_band + (std * std_dev)
    lower_band = middle_band - (std * std_dev)
    
    return {
        "middle_band": middle_band.tolist(),
        "upper_band": upper_band.tolist(),
        "lower_band": lower_band.tolist()
    }

def calculate_volume_ma(volumes: List[int], period: int = 5) -> List[float]:
    """计算成交量移动平均"""
    return pd.Series(volumes).rolling(window=period).mean().tolist()

def calculate_price_change(prices: List[float]) -> Dict[str, float]:
    """计算价格变化"""
    if not prices:
        return {"change": 0, "change_percent": 0}
    
    current_price = prices[-1]
    previous_price = prices[-2] if len(prices) > 1 else prices[0]
    
    change = current_price - previous_price
    change_percent = (change / previous_price) * 100
    
    return {
        "change": round(change, 2),
        "change_percent": round(change_percent, 2)
    } 