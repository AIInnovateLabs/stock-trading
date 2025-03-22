FROM python:3.11-slim

WORKDIR /app

# 完全清理并使用阿里云源加速
RUN rm -rf /etc/apt/sources.list.d/* && \
    rm -rf /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm main non-free-firmware non-free contrib" > /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian/ bookworm main non-free-firmware non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian-security/ bookworm-security main non-free-firmware non-free contrib" >> /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian-security/ bookworm-security main non-free-firmware non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.aliyun.com/debian/ bookworm-updates main non-free-firmware non-free contrib" >> /etc/apt/sources.list && \
    echo "deb-src https://mirrors.aliyun.com/debian/ bookworm-updates main non-free-firmware non-free contrib" >> /etc/apt/sources.list && \
    apt-get clean all && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 配置pip使用清华源
COPY pip.conf /etc/pip.conf

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 暴露端口
EXPOSE 8000

# 启动命令在 docker-compose.yml 中定义 