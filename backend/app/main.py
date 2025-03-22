from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import stocks, analysis
from app.db.init_db import init_db
from app.api.v1.api import api_router

# 初始化数据库
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="股票交易系统API，提供股票数据获取、分析和导出功能",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 设置CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 注册路由
app.include_router(
    stocks.router,
    prefix=f"{settings.API_V1_STR}/stocks",
    tags=["stocks"],
    responses={404: {"description": "Not found"}},
)
app.include_router(
    analysis.router,
    prefix=f"{settings.API_V1_STR}/analysis",
    tags=["analysis"],
    responses={404: {"description": "Not found"}},
)
app.include_router(api_router, prefix="/api/v1")

@app.get("/", tags=["root"])
def read_root():
    """
    欢迎页面
    
    返回系统基本信息
    """
    return {
        "message": "Welcome to Stock Trading System API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
