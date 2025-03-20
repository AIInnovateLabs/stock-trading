from datetime import datetime, timedelta
import logging
import akshare as ak
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.stock import StockBasic, StockTrade
from app.schemas.stock import StockBasicCreate, StockTradeCreate

logger = logging.getLogger(__name__)

def update_stock_basics(db: Session):
    """更新股票基础数据"""
    try:
        logger.info("开始更新股票基础数据")
        
        # 获取A股股票列表
        logger.info("正在从Akshare获取A股股票列表...")
        try:
            # 尝试使用东方财富接口
            stock_df = ak.stock_zh_a_spot_em()
            logger.info("使用东方财富接口获取数据成功")
        except Exception as e:
            logger.warning(f"东方财富接口获取失败，尝试使用新浪接口：{str(e)}")
            try:
                stock_df = ak.stock_zh_a_spot()
                logger.info("使用新浪接口获取数据成功")
            except Exception as e:
                logger.error(f"新浪接口获取失败：{str(e)}")
                raise ValueError("无法获取股票列表数据")
        
        if stock_df.empty:
            logger.error("获取股票列表失败：数据为空")
            raise ValueError("获取股票列表失败：数据为空")
            
        logger.info(f"成功获取股票列表，共{len(stock_df)}条记录")
        logger.debug(f"股票列表数据示例：\n{stock_df.head()}")
        logger.debug(f"股票列表列名：{stock_df.columns.tolist()}")
        
        # 获取行业信息
        logger.info("正在从Akshare获取行业信息...")
        try:
            industry_df = ak.stock_board_industry_name_em()
            logger.info("使用东方财富接口获取行业信息成功")
        except Exception as e:
            logger.error(f"获取行业信息失败：{str(e)}")
            # 如果获取行业信息失败，使用空数据框
            industry_df = pd.DataFrame(columns=['板块代码', '板块名称'])
            logger.warning("使用空的行业信息数据")
            
        if not industry_df.empty:
            logger.info(f"成功获取行业信息，共{len(industry_df)}条记录")
            logger.debug(f"行业信息数据示例：\n{industry_df.head()}")
            logger.debug(f"行业信息列名：{industry_df.columns.tolist()}")
        
        # 合并数据
        logger.info("正在合并股票列表和行业信息...")
        if not industry_df.empty:
            merged_df = stock_df.merge(
                industry_df[['板块代码', '板块名称']],
                left_on='代码',
                right_on='板块代码',
                how='left'
            )
        else:
            merged_df = stock_df.copy()
            merged_df['板块名称'] = None
            
        logger.debug(f"合并后的数据示例：\n{merged_df.head()}")
        
        # 重命名列
        logger.info("正在重命名数据列...")
        merged_df = merged_df.rename(columns={
            '代码': 'code',
            '名称': 'name',
            '板块名称': 'industry'
        })
        logger.debug(f"重命名后的列名：{merged_df.columns.tolist()}")
        
        # 添加市场信息
        logger.info("正在添加市场信息...")
        merged_df['market'] = merged_df['code'].apply(
            lambda x: '主板' if x.startswith(('600', '601', '603', '605')) 
            else '创业板' if x.startswith('300')
            else '科创板' if x.startswith('688')
            else '北交所' if x.startswith('8')
            else '中小板'
        )
        logger.debug(f"市场信息分布：\n{merged_df['market'].value_counts()}")
        
        # 添加更新时间
        logger.info("正在添加更新时间...")
        merged_df['update_time'] = datetime.now()
        
        # 更新数据库
        logger.info("开始更新数据库...")
        updated_count = 0
        error_count = 0
        
        for index, row in merged_df.iterrows():
            try:
                stock_data = {
                    'code': row['code'],
                    'name': row['name'],
                    'industry': row['industry'],
                    'market': row['market'],
                    'update_time': row['update_time']
                }
                
                logger.debug(f"正在处理第{index + 1}条数据：{stock_data}")
                
                db_stock = db.query(StockBasic).filter(StockBasic.code == stock_data['code']).first()
                if db_stock:
                    logger.debug(f"更新已存在的股票数据：{stock_data['code']}")
                    for key, value in stock_data.items():
                        setattr(db_stock, key, value)
                    updated_count += 1
                else:
                    logger.debug(f"添加新的股票数据：{stock_data['code']}")
                    db_stock = StockBasic(**stock_data)
                    db.add(db_stock)
                    updated_count += 1
                    
            except Exception as e:
                error_count += 1
                logger.error(f"处理股票{row['code']}数据失败：{str(e)}")
                logger.error(f"错误详情：", exc_info=True)
                continue
        
        logger.info(f"数据库更新完成，成功更新{updated_count}条记录，失败{error_count}条记录")
        
        try:
            db.commit()
            logger.info("数据库事务提交成功")
        except Exception as e:
            logger.error(f"数据库事务提交失败：{str(e)}")
            logger.error("错误详情：", exc_info=True)
            db.rollback()
            raise e
            
        return {"message": "股票基础数据更新成功", "updated_count": updated_count, "error_count": error_count}
        
    except Exception as e:
        logger.error(f"更新股票基础数据失败：{str(e)}")
        logger.error("错误详情：", exc_info=True)
        db.rollback()
        raise e

def get_stock_basics(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    industry: str = None,
    market: str = None,
    search: str = None
):
    """获取股票基础数据列表"""
    try:
        logger.info(f"开始获取股票基础数据，参数：skip={skip}, limit={limit}, industry={industry}, market={market}, search={search}")
        
        query = db.query(StockBasic)
        
        if industry:
            logger.debug(f"添加行业筛选条件：{industry}")
            query = query.filter(StockBasic.industry == industry)
        if market:
            logger.debug(f"添加市场筛选条件：{market}")
            query = query.filter(StockBasic.market == market)
        if search:
            logger.debug(f"添加搜索条件：{search}")
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    StockBasic.code.like(search_pattern),
                    StockBasic.name.like(search_pattern)
                )
            )
            
        total = query.count()
        logger.info(f"符合条件的记录总数：{total}")
        
        items = query.offset(skip).limit(limit).all()
        logger.info(f"成功获取{len(items)}条记录")
        
        return {
            "total": total,
            "items": items,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"获取股票基础数据失败：{str(e)}")
        logger.error("错误详情：", exc_info=True)
        raise e

def get_stock_trades(
    db: Session,
    stock_code: str,
    start_date: str = None,
    end_date: str = None,
    skip: int = 0,
    limit: int = 100
):
    """获取股票交易数据"""
    try:
        logger.info(f"开始获取股票{stock_code}的交易数据，参数：start_date={start_date}, end_date={end_date}, skip={skip}, limit={limit}")
        
        query = db.query(StockTrade).join(StockBasic).filter(StockBasic.code == stock_code)
        
        if start_date:
            logger.debug(f"添加开始日期筛选条件：{start_date}")
            query = query.filter(StockTrade.trade_date >= datetime.strptime(start_date, '%Y-%m-%d'))
        if end_date:
            logger.debug(f"添加结束日期筛选条件：{end_date}")
            query = query.filter(StockTrade.trade_date <= datetime.strptime(end_date, '%Y-%m-%d'))
            
        total = query.count()
        logger.info(f"符合条件的记录总数：{total}")
        
        items = query.order_by(StockTrade.trade_date.desc()).offset(skip).limit(limit).all()
        logger.info(f"成功获取{len(items)}条记录")
        
        return {
            "total": total,
            "items": items,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"获取股票{stock_code}交易数据失败：{str(e)}")
        logger.error("错误详情：", exc_info=True)
        raise e

def get_stock_basic(db: Session, code: str):
    """获取单个股票基础数据"""
    try:
        logger.info(f"开始获取股票 {code} 的基础数据")
        
        stock = db.query(StockBasic).filter(StockBasic.code == code).first()
        
        if stock:
            logger.info(f"成功获取股票 {code} 的基础数据")
        else:
            logger.warning(f"股票 {code} 不存在")
            
        return stock
        
    except Exception as e:
        logger.error(f"获取股票 {code} 基础数据失败：{str(e)}")
        logger.error("错误详情：", exc_info=True)
        raise e

def update_stock_trades(db: Session, stock_code: str = None, days: int = 30):
    """更新股票交易数据
    
    Args:
        db (Session): 数据库会话
        stock_code (str, optional): 股票代码。如果不指定，则更新所有股票
        days (int, optional): 要获取的天数。默认30天
    """
    try:
        logger.info(f"开始更新股票交易数据：stock_code={stock_code}, days={days}")
        
        # 确定要更新的股票列表
        if stock_code:
            stocks = db.query(StockBasic).filter(StockBasic.code == stock_code).all()
        else:
            stocks = db.query(StockBasic).all()
            
        if not stocks:
            logger.warning(f"没有找到需要更新的股票")
            return {"message": "没有找到需要更新的股票", "updated_count": 0}
            
        total_updated = 0
        error_count = 0
        
        for stock in stocks:
            try:
                logger.info(f"正在获取股票 {stock.code} 的交易数据...")
                
                # 使用 akshare 获取股票历史数据
                try:
                    # 尝试使用东方财富接口
                    df = ak.stock_zh_a_hist(symbol=stock.code, period="daily", 
                                          start_date=(datetime.now() - timedelta(days=days)).strftime("%Y%m%d"),
                                          end_date=datetime.now().strftime("%Y%m%d"),
                                          adjust="qfq")
                    logger.info(f"使用东方财富接口获取 {stock.code} 交易数据成功")
                except Exception as e:
                    logger.error(f"获取股票 {stock.code} 交易数据失败：{str(e)}")
                    error_count += 1
                    continue
                
                if df.empty:
                    logger.warning(f"股票 {stock.code} 没有交易数据")
                    continue
                    
                # 重命名列
                df = df.rename(columns={
                    "日期": "trade_date",
                    "开盘": "open_price",
                    "最高": "high_price",
                    "最低": "low_price",
                    "收盘": "close_price",
                    "成交量": "volume",
                    "成交额": "amount"
                })
                
                # 转换日期格式
                df["trade_date"] = pd.to_datetime(df["trade_date"])
                
                # 更新数据库
                for _, row in df.iterrows():
                    # 检查是否已存在该日期的数据
                    existing = db.query(StockTrade).filter(
                        StockTrade.stock_id == stock.id,
                        StockTrade.trade_date == row["trade_date"]
                    ).first()
                    
                    trade_data = {
                        "stock_id": stock.id,
                        "trade_date": row["trade_date"],
                        "open_price": row["open_price"],
                        "high_price": row["high_price"],
                        "low_price": row["low_price"],
                        "close_price": row["close_price"],
                        "volume": row["volume"],
                        "amount": row["amount"]
                    }
                    
                    if existing:
                        # 更新现有记录
                        for key, value in trade_data.items():
                            setattr(existing, key, value)
                    else:
                        # 创建新记录
                        db_trade = StockTrade(**trade_data)
                        db.add(db_trade)
                    
                    total_updated += 1
                
                logger.info(f"股票 {stock.code} 的交易数据更新成功")
                
            except Exception as e:
                error_count += 1
                logger.error(f"处理股票 {stock.code} 交易数据时出错：{str(e)}")
                logger.error("错误详情：", exc_info=True)
                continue
        
        try:
            db.commit()
            logger.info("数据库事务提交成功")
        except Exception as e:
            logger.error(f"数据库事务提交失败：{str(e)}")
            logger.error("错误详情：", exc_info=True)
            db.rollback()
            raise e
        
        return {
            "message": "股票交易数据更新成功",
            "updated_count": total_updated,
            "error_count": error_count
        }
        
    except Exception as e:
        logger.error(f"更新股票交易数据失败：{str(e)}")
        logger.error("错误详情：", exc_info=True)
        db.rollback()
        raise e 