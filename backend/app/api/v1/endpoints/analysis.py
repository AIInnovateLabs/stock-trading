from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.stock import StockTrade
from app.services import stock, analysis, export
from datetime import datetime

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
        # 首先检查股票是否存在
        stock_info = stock.get_stock_basic(db=db, code=stock_code)
        if not stock_info:
            raise HTTPException(
                status_code=404,
                detail=f"股票 {stock_code} 不存在"
            )

        # 计算日期范围内的天数作为 limit
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            days = (end - start).days + 1
            limit = max(days, 100)
        else:
            limit = 100

        # 获取交易数据
        trades_response = stock.get_stock_trades(
            db=db,
            stock_code=stock_code,
            start_date=start_date,
            end_date=end_date,
            limit=limit
        )
        
        if not trades_response or not trades_response["items"]:
            raise HTTPException(
                status_code=404,
                detail=f"未找到股票 {stock_code} 在指定时间范围内的交易数据"
            )
        
        if len(trades_response["items"]) < 30:  # 至少需要30天数据才能计算技术指标
            raise HTTPException(
                status_code=400,
                detail=f"股票 {stock_code} 在指定时间范围内的交易数据不足30天，无法计算技术指标"
            )

        # 提取价格、成交量和日期数据，并按日期排序
        trades = sorted(trades_response["items"], key=lambda x: x.trade_date)
        prices = [trade.close_price for trade in trades]
        volumes = [trade.volume for trade in trades]
        dates = [trade.trade_date.strftime('%Y-%m-%d') for trade in trades]
        
        # 计算各项技术指标
        results = {
            "dates": dates,
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
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"计算技术指标时发生错误: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="计算技术指标时发生错误，请稍后重试"
        )

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