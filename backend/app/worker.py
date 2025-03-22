from celery import Celery

# 创建 Celery 实例
celery = Celery(
    'app',
    broker='redis://redis:6379/0',
    backend='redis://redis:6379/1',
    include=['app.tasks']  # 这里将包含任务定义
)

# 可选的配置
celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Shanghai',
    enable_utc=True,
) 