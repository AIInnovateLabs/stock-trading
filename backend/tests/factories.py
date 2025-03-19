from datetime import date, datetime
from app.models.stock import StockBasic, StockTrade

def create_stock_basic(db_session, **kwargs):
    """创建股票基础数据"""
    stock = StockBasic(
        code=kwargs.get("code", "000001"),
        name=kwargs.get("name", "测试股票"),
        industry=kwargs.get("industry", "测试行业"),
        market=kwargs.get("market", "主板"),
        list_date=kwargs.get("list_date", date(2020, 1, 1))
    )
    db_session.add(stock)
    db_session.commit()
    db_session.refresh(stock)
    return stock

def create_stock_trade(db_session, stock_id, **kwargs):
    """创建股票交易数据"""
    trade = StockTrade(
        stock_id=stock_id,
        trade_date=kwargs.get("trade_date", date(2023, 1, 1)),
        open_price=kwargs.get("open_price", 10.0),
        high_price=kwargs.get("high_price", 11.0),
        low_price=kwargs.get("low_price", 9.0),
        close_price=kwargs.get("close_price", 10.5),
        volume=kwargs.get("volume", 1000000),
        amount=kwargs.get("amount", 10500000.0)
    )
    db_session.add(trade)
    db_session.commit()
    db_session.refresh(trade)
    return trade 