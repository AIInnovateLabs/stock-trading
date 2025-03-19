from sqlalchemy.orm import Session
from app.models.base import Base
from app.db.session import engine
from app.db.migrations import migrate_add_update_time

def init_db() -> None:
    """初始化数据库"""
    try:
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        print("数据库表创建成功")
        
        # 执行数据库迁移
        migrate_add_update_time()
        print("数据库迁移执行成功")
        
    except Exception as e:
        print(f"数据库初始化失败：{str(e)}")
        raise e 