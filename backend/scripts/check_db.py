import sqlite3
import pandas as pd
from tabulate import tabulate

def check_database():
    # 连接数据库（使用与应用相同的路径）
    conn = sqlite3.connect('./stock_trading.db')
    
    # 获取所有表名
    tables_query = """
    SELECT name FROM sqlite_master 
    WHERE type='table';
    """
    tables = pd.read_sql_query(tables_query, conn)
    print("\n=== 数据库中的表 ===")
    print(tables)
    
    # 检查表结构
    print("\n=== 表结构信息 ===")
    for table_name in tables['name']:
        structure_query = f"PRAGMA table_info({table_name});"
        structure = pd.read_sql_query(structure_query, conn)
        print(f"\n{table_name} 表结构:")
        print(tabulate(structure, headers='keys', tablefmt='psql'))
    
    # 检查 stock_basics 表
    try:
        basics_query = """
        SELECT COUNT(*) as total_stocks,
               COUNT(DISTINCT industry) as total_industries,
               COUNT(DISTINCT market) as total_markets,
               MAX(update_time) as last_update
        FROM stock_basics;
        """
        basics_stats = pd.read_sql_query(basics_query, conn)
        print("\n=== 股票基础数据统计 ===")
        print(tabulate(basics_stats, headers='keys', tablefmt='psql'))
        
        # 显示部分股票数据
        sample_query = """
        SELECT * FROM stock_basics LIMIT 5;
        """
        sample_data = pd.read_sql_query(sample_query, conn)
        print("\n=== 股票数据示例（前5条） ===")
        print(tabulate(sample_data, headers='keys', tablefmt='psql'))
        
    except Exception as e:
        print(f"查询 stock_basics 表时出错：{str(e)}")
    
    # 检查 stock_trades 表
    try:
        trades_query = """
        SELECT * FROM stock_trades LIMIT 5;
        """
        trades_sample = pd.read_sql_query(trades_query, conn)
        print("\n=== 交易数据示例（前5条） ===")
        print(tabulate(trades_sample, headers='keys', tablefmt='psql'))
        
    except Exception as e:
        print(f"查询 stock_trades 表时出错：{str(e)}")
    
    conn.close()

if __name__ == "__main__":
    check_database() 