from .worker import celery

@celery.task
def add(x, y):
    return x + y 