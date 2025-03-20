FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 5173

# 启动命令在 docker-compose.yml 中定义 