FROM node:18-alpine as builder

WORKDIR /app

# 设置淘宝 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package.json package-lock.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建静态文件（忽略 TypeScript 错误）
RUN npm run build

# 使用 nginx 来 serve 静态文件
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80 