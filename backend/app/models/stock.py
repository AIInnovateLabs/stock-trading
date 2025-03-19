from sqlalchemy import Column, String, Date, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class StockBasic(BaseModel):
    __tablename__ = "stock_basics"
    
    code = Column(String(10), unique=True, index=True, nullable=False, comment="股票代码")
    name = Column(String(50), nullable=False, comment="股票名称")
    industry = Column(String(50), comment="所属行业")
    market = Column(String(20), comment="市场类型")
    list_date = Column(Date, comment="上市日期")
    update_time = Column(DateTime, nullable=False, comment="更新时间")
    
    # 关联关系
    trades = relationship("StockTrade", back_populates="stock")

class StockTrade(BaseModel):
    __tablename__ = "stock_trades"
    
    stock_id = Column(Integer, ForeignKey("stock_basics.id"), nullable=False)
    trade_date = Column(Date, nullable=False, comment="交易日期")
    open_price = Column(Float, comment="开盘价")
    high_price = Column(Float, comment="最高价")
    low_price = Column(Float, comment="最低价")
    close_price = Column(Float, comment="收盘价")
    volume = Column(Integer, comment="成交量")
    amount = Column(Float, comment="成交额")
    
    # 关联关系
    stock = relationship("StockBasic", back_populates="trades") 