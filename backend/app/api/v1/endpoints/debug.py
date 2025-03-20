from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.stock import StockBasic, StockTrade

router = APIRouter(
    prefix="/debug",
    tags=["debug"],
)

@router.get("/db-info", response_model=Dict[str, Any])
def get_db_info(db: Session = Depends(get_db)):
    """获取数据库信息"""
    # 获取表信息
    tables = [
        {
            "name": "stock_basics",
            "count": db.query(StockBasic).count()
        },
        {
            "name": "stock_trades",
            "count": db.query(StockTrade).count()
        }
    ]
    
    # 获取股票数据示例
    stock_basics = db.query(StockBasic).limit(5).all()
    stock_trades = db.query(StockTrade).limit(5).all()
    
    return {
        "tables": tables,
        "stockBasics": [
            {
                "code": stock.code,
                "name": stock.name,
                "industry": stock.industry,
                "market": stock.market,
                "update_time": stock.update_time
            }
            for stock in stock_basics
        ],
        "stockTrades": [
            {
                "stock_id": trade.stock_id,
                "trade_date": trade.trade_date,
                "open_price": trade.open_price,
                "high_price": trade.high_price,
                "low_price": trade.low_price,
                "close_price": trade.close_price,
                "volume": trade.volume,
                "amount": trade.amount,
                "update_time": trade.updated_at
            }
            for trade in stock_trades
        ]
    } 