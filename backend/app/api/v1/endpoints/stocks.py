from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.stock import StockBasic, StockTrade, StockBasicList, StockTradeList
from app.services import stock

router = APIRouter(
    tags=["stocks"],
    responses={404: {"description": "Not found"}},
)

@router.post("/basics/update", response_model=Dict[str, Any])
def update_stock_basics(db: Session = Depends(get_db)):
    """
    更新股票基础数据
    
    从Akshare获取最新的股票基础数据并更新到数据库
    
    Returns:
        Dict[str, Any]: 包含更新状态和更新数量的消息
    """
    try:
        return stock.update_stock_basics(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/basics", response_model=StockBasicList)
def get_stock_basics(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=100, description="返回记录数"),
    industry: str = Query(None, description="行业筛选"),
    market: str = Query(None, description="市场类型筛选"),
    search: str = Query(None, description="搜索股票代码或名称"),
    db: Session = Depends(get_db)
):
    """
    获取股票基础数据列表
    
    支持分页、按行业和市场类型筛选，以及按股票代码或名称搜索
    
    Parameters:
        skip: 跳过记录数
        limit: 返回记录数（1-100）
        industry: 行业名称
        market: 市场类型（主板/创业板/科创板/北交所/中小板）
        search: 搜索股票代码或名称
    
    Returns:
        StockBasicList: 包含总数、数据列表和分页信息
    """
    return stock.get_stock_basics(
        db=db,
        skip=skip,
        limit=limit,
        industry=industry,
        market=market,
        search=search
    )

@router.get("/trades/{stock_code}", response_model=StockTradeList)
def get_stock_trades(
    stock_code: str,
    start_date: str = Query(None, description="开始日期（YYYY-MM-DD）"),
    end_date: str = Query(None, description="结束日期（YYYY-MM-DD）"),
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=100, description="返回记录数"),
    db: Session = Depends(get_db)
):
    """
    获取股票交易数据
    
    支持按日期范围筛选和分页
    
    Parameters:
        stock_code: 股票代码
        start_date: 开始日期
        end_date: 结束日期
        skip: 跳过记录数
        limit: 返回记录数（1-100）
    
    Returns:
        StockTradeList: 包含总数、数据列表和分页信息
    """
    return stock.get_stock_trades(
        db=db,
        stock_code=stock_code,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=limit
    )

@router.get("/basics/{code}", response_model=StockBasic)
def get_stock_basic(
    code: str,
    db: Session = Depends(get_db)
):
    """
    获取单个股票基础数据
    
    Parameters:
        code: 股票代码
    
    Returns:
        StockBasic: 股票基础数据
    """
    result = stock.get_stock_basic(db=db, code=code)
    if not result:
        raise HTTPException(status_code=404, detail=f"股票 {code} 不存在")
    return result

@router.post("/trades/update", response_model=Dict[str, Any])
def update_stock_trades(
    stock_code: str = Query(None, description="股票代码（可选，不指定则更新所有股票）"),
    days: int = Query(30, ge=1, le=365, description="要获取的天数（1-365天）"),
    db: Session = Depends(get_db)
):
    """
    更新股票交易数据
    
    从Akshare获取最新的股票交易数据并更新到数据库
    
    Parameters:
        stock_code: 股票代码（可选，不指定则更新所有股票）
        days: 要获取的天数（1-365天）
    
    Returns:
        Dict[str, Any]: 包含更新状态和更新数量的消息
    """
    try:
        return stock.update_stock_trades(db, stock_code=stock_code, days=days)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 