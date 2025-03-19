import pandas as pd
from typing import List, Dict
from datetime import datetime
from app.schemas.stock import StockBasic, StockTrade

def export_stock_basics_to_csv(stocks: List[StockBasic], filename: str = None) -> str:
    """导出股票基础数据为CSV格式"""
    if not filename:
        filename = f"stock_basics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    # 转换为DataFrame
    df = pd.DataFrame([stock.dict() for stock in stocks])
    
    # 保存为CSV
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    
    return filename

def export_stock_basics_to_excel(stocks: List[StockBasic], filename: str = None) -> str:
    """导出股票基础数据为Excel格式"""
    if not filename:
        filename = f"stock_basics_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    # 转换为DataFrame
    df = pd.DataFrame([stock.dict() for stock in stocks])
    
    # 保存为Excel
    df.to_excel(filename, index=False)
    
    return filename

def export_stock_trades_to_csv(trades: List[StockTrade], filename: str = None) -> str:
    """导出股票交易数据为CSV格式"""
    if not filename:
        filename = f"stock_trades_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    # 转换为DataFrame
    df = pd.DataFrame([trade.dict() for trade in trades])
    
    # 保存为CSV
    df.to_csv(filename, index=False, encoding='utf-8-sig')
    
    return filename

def export_stock_trades_to_excel(trades: List[StockTrade], filename: str = None) -> str:
    """导出股票交易数据为Excel格式"""
    if not filename:
        filename = f"stock_trades_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    # 转换为DataFrame
    df = pd.DataFrame([trade.dict() for trade in trades])
    
    # 保存为Excel
    df.to_excel(filename, index=False)
    
    return filename

def export_analysis_results(results: Dict, filename: str = None) -> str:
    """导出分析结果为Excel格式"""
    if not filename:
        filename = f"analysis_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    # 创建Excel写入器
    with pd.ExcelWriter(filename) as writer:
        # 将每个分析结果写入不同的sheet
        for sheet_name, data in results.items():
            if isinstance(data, pd.DataFrame):
                data.to_excel(writer, sheet_name=sheet_name, index=False)
            else:
                pd.DataFrame(data).to_excel(writer, sheet_name=sheet_name, index=False)
    
    return filename 