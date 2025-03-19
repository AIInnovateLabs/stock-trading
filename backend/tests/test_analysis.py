import pytest
from datetime import date
from tests.factories import create_stock_basic, create_stock_trade

def test_get_technical_indicators(client, db_session):
    """测试获取技术指标数据"""
    # 创建测试数据
    stock = create_stock_basic(db_session, code="000001", name="测试股票")
    
    # 创建30天的交易数据
    for i in range(30):
        create_stock_trade(
            db_session,
            stock.id,
            trade_date=date(2023, 1, i + 1),
            open_price=10.0 + i * 0.1,
            high_price=10.5 + i * 0.1,
            low_price=9.5 + i * 0.1,
            close_price=10.0 + i * 0.1,
            volume=1000000,
            amount=10000000.0
        )
    
    # 测试获取技术指标
    response = client.get(f"/api/v1/analysis/indicators/{stock.code}")
    assert response.status_code == 200
    data = response.json()
    
    # 验证返回的指标
    assert "ma5" in data
    assert "ma10" in data
    assert "ma20" in data
    assert "macd" in data
    assert "rsi" in data
    assert "bollinger_bands" in data
    assert "volume_ma" in data
    assert "price_change" in data

def test_export_stock_basics(client, db_session):
    """测试导出股票基础数据"""
    # 创建测试数据
    create_stock_basic(db_session, code="000001", name="测试股票1")
    create_stock_basic(db_session, code="000002", name="测试股票2")
    
    # 测试CSV导出
    response = client.get("/api/v1/analysis/export/basics?format=csv")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".csv")
    
    # 测试Excel导出
    response = client.get("/api/v1/analysis/export/basics?format=excel")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".xlsx")

def test_export_stock_trades(client, db_session):
    """测试导出股票交易数据"""
    # 创建测试数据
    stock = create_stock_basic(db_session, code="000001", name="测试股票")
    create_stock_trade(db_session, stock.id, trade_date=date(2023, 1, 1))
    create_stock_trade(db_session, stock.id, trade_date=date(2023, 1, 2))
    
    # 测试CSV导出
    response = client.get(f"/api/v1/analysis/export/trades/{stock.code}?format=csv")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".csv")
    
    # 测试Excel导出
    response = client.get(f"/api/v1/analysis/export/trades/{stock.code}?format=excel")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".xlsx")

def test_export_analysis_results(client, db_session):
    """测试导出分析结果"""
    # 创建测试数据
    stock = create_stock_basic(db_session, code="000001", name="测试股票")
    
    # 创建30天的交易数据
    for i in range(30):
        create_stock_trade(
            db_session,
            stock.id,
            trade_date=date(2023, 1, i + 1),
            open_price=10.0 + i * 0.1,
            high_price=10.5 + i * 0.1,
            low_price=9.5 + i * 0.1,
            close_price=10.0 + i * 0.1,
            volume=1000000,
            amount=10000000.0
        )
    
    # 测试导出分析结果
    response = client.get(f"/api/v1/analysis/export/analysis/{stock.code}")
    assert response.status_code == 200
    data = response.json()
    assert "filename" in data
    assert data["filename"].endswith(".xlsx") 