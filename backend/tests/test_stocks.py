import pytest
from datetime import date
from app.models.stock import StockBasic
from tests.factories import create_stock_basic, create_stock_trade

def test_update_stock_basics(client):
    """测试更新股票基础数据"""
    response = client.post("/api/v1/stocks/basics/update")
    assert response.status_code == 200
    assert "message" in response.json()

def test_get_stock_basics(client, db_session):
    """测试获取股票基础数据列表"""
    # 创建测试数据
    stock1 = create_stock_basic(db_session, code="000001", name="测试股票1")
    stock2 = create_stock_basic(db_session, code="000002", name="测试股票2")
    
    # 测试获取所有数据
    response = client.get("/api/v1/stocks/basics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # 测试分页
    response = client.get("/api/v1/stocks/basics?skip=0&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    
    # 测试按行业筛选
    response = client.get("/api/v1/stocks/basics?industry=测试行业")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # 测试按市场筛选
    response = client.get("/api/v1/stocks/basics?market=主板")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

def test_get_stock_trades(client, db_session):
    """测试获取股票交易数据"""
    # 创建测试数据
    stock = create_stock_basic(db_session, code="000001", name="测试股票")
    trade1 = create_stock_trade(db_session, stock.id, trade_date=date(2023, 1, 1))
    trade2 = create_stock_trade(db_session, stock.id, trade_date=date(2023, 1, 2))
    
    # 测试获取交易数据
    response = client.get(f"/api/v1/stocks/trades/{stock.code}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    
    # 测试日期筛选
    response = client.get(f"/api/v1/stocks/trades/{stock.code}?start_date=2023-01-01&end_date=2023-01-01")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    
    # 测试分页
    response = client.get(f"/api/v1/stocks/trades/{stock.code}?skip=0&limit=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1 