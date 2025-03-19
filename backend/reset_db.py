import os
from app.db.session import engine
from app.db.init_db import init_db

def reset_database():
    """重置数据库"""
    try:
        # 删除数据库文件
        db_file = "stock_trading.db"
        if os.path.exists(db_file):
            os.remove(db_file)
            print(f"已删除数据库文件：{db_file}")
        
        # 重新初始化数据库
        init_db()
        print("数据库重置成功")
        
    except Exception as e:
        print(f"重置数据库失败：{str(e)}")
        raise e

if __name__ == "__main__":
    reset_database() 