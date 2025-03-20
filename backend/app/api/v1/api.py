from fastapi import APIRouter
from app.api.v1.endpoints import stocks, debug

api_router = APIRouter()
api_router.include_router(stocks.router)
api_router.include_router(debug.router) 