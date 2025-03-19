from sqlalchemy import text
from app.db.session import engine

def migrate_add_update_time():
    """添加update_time字段到stock_basics表"""
    try:
        with engine.connect() as connection:
            # 检查表是否存在
            result = connection.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='stock_basics'
            """))
            
            if not result.fetchone():
                print("stock_basics表不存在，跳过迁移")
                return
                
            # 检查update_time字段是否存在
            result = connection.execute(text("""
                SELECT name FROM pragma_table_info('stock_basics') 
                WHERE name = 'update_time'
            """))
            
            if not result.fetchone():
                # 添加update_time字段
                connection.execute(text("""
                    ALTER TABLE stock_basics 
                    ADD COLUMN update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                """))
                connection.commit()
                print("成功添加update_time字段")
            else:
                print("update_time字段已存在")
                
    except Exception as e:
        print(f"添加update_time字段失败：{str(e)}")
        raise e 