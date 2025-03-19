from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.stock import StockTrade
from app.services import stock, analysis, export

router = APIRouter()

@router.get("/indicators/{stock_code}")
def get_technical_indicators(
    stock_code: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """获取技术指标数据"""
    try:
        # 获取交易数据
        trades = stock.get_stock_trades(
            db=db,
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date
        )
        
        if not trades:
            raise HTTPException(status_code=404, detail="未找到交易数据")
        
        # 提取价格和成交量数据
        prices = [trade.close_price for trade in trades]
        volumes = [trade.volume for trade in trades]
        
        # 计算各项技术指标
        results = {
            "ma5": analysis.calculate_ma(prices, 5),
            "ma10": analysis.calculate_ma(prices, 10),
            "ma20": analysis.calculate_ma(prices, 20),
            "macd": analysis.calculate_macd(prices),
            "rsi": analysis.calculate_rsi(prices),
            "bollinger_bands": analysis.calculate_bollinger_bands(prices),
            "volume_ma": analysis.calculate_volume_ma(volumes),
            "price_change": analysis.calculate_price_change(prices)
        }
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/basics")
def export_stock_basics(
    format: str = Query("csv", regex="^(csv|excel)$"),
    db: Session = Depends(get_db)
):
    """导出股票基础数据"""
    try:
        stocks = stock.get_stock_basics(db=db)
        
        if format == "csv":
            filename = export.export_stock_basics_to_csv(stocks)
        else:
            filename = export.export_stock_basics_to_excel(stocks)
            
        return {"filename": filename, "message": "导出成功"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/trades/{stock_code}")
def export_stock_trades(
    stock_code: str,
    format: str = Query("csv", regex="^(csv|excel)$"),
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """导出股票交易数据"""
    try:
        trades = stock.get_stock_trades(
            db=db,
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date
        )
        
        if format == "csv":
            filename = export.export_stock_trades_to_csv(trades)
        else:
            filename = export.export_stock_trades_to_excel(trades)
            
        return {"filename": filename, "message": "导出成功"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/export/analysis/{stock_code}")
def export_analysis_results(
    stock_code: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db)
):
    """导出分析结果"""
    try:
        # 获取技术指标数据
        indicators = get_technical_indicators(
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            db=db
        )
        
        # 导出分析结果
        filename = export.export_analysis_results(indicators)
        
        return {"filename": filename, "message": "导出成功"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 