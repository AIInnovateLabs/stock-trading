from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional, List

class StockBasicBase(BaseModel):
    code: str
    name: str
    industry: Optional[str] = None
    market: Optional[str] = None
    list_date: Optional[date] = None
    update_time: datetime

class StockBasicCreate(StockBasicBase):
    pass

class StockBasic(BaseModel):
    """
    股票基础信息模型
    
    包含股票的基本信息，如代码、名称、行业等
    """
    id: int
    code: str
    name: str
    industry: Optional[str] = None
    market: Optional[str] = None
    list_date: Optional[date] = None
    update_time: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class StockTradeBase(BaseModel):
    trade_date: date
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None
    volume: Optional[int] = None
    amount: Optional[float] = None

class StockTradeCreate(StockTradeBase):
    stock_id: int

class StockTrade(BaseModel):
    """
    股票交易数据模型
    
    包含股票的每日交易数据，如开盘价、收盘价、成交量等
    """
    id: int
    stock_id: int
    trade_date: date
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None
    volume: Optional[int] = None
    amount: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class StockBasicList(BaseModel):
    """
    股票基础信息列表响应模型
    """
    total: int
    items: List[StockBasic]
    skip: int
    limit: int

class StockTradeList(BaseModel):
    """
    股票交易数据列表响应模型
    """
    total: int
    items: List[StockTrade]
    skip: int
    limit: int 