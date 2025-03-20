# Docker 环境配置指南

## 问题描述

在 macOS 环境下使用 Colima 运行 Docker 时，可能会遇到镜像拉取超时的问题：
```bash
Error response from daemon: Get "https://registry-1.docker.io/v2/": context deadline exceeded
```

## 解决方案

### 1. 基础环境安装

```bash
# 安装必要的工具
brew install docker
brew install docker-compose
brew install colima
```

### 2. 配置 Docker 镜像加速

1. 创建或修改 Docker 配置文件：
```bash
mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
  "auths": {},
  "registry-mirrors": [
    "https://docker.hlmirror.com/"
  ]
}
EOF
```

2. 在 Colima VM 中配置 Docker 守护进程：
```bash
# 删除现有的 Colima 实例（如果存在）
colima delete

# 启动 Colima（使用公共 DNS 服务器）
colima start --dns 8.8.8.8,223.5.5.5

# 在 Colima VM 中配置镜像加速
echo '{"registry-mirrors": ["https://docker.hlmirror.com/"]}' | colima ssh -- sudo tee /etc/docker/daemon.json

# 重启 Docker 守护进程
colima ssh -- sudo systemctl restart docker
```

### 3. 验证配置

测试镜像拉取是否正常：
```bash
docker pull nginx:alpine
```

如果看到类似以下输出，说明配置成功：
```
alpine: Pulling from library/nginx
6e771e15690e: Pull complete 
...
Status: Downloaded newer image for nginx:alpine
docker.io/library/nginx:alpine
```

## 原理说明

1. **为什么需要这样配置？**
   - Docker 默认使用官方镜像仓库，在国内访问可能较慢
   - Colima 使用虚拟机运行 Docker，需要在虚拟机内部配置镜像加速
   - 使用公共 DNS 服务器可以避免某些 DNS 解析问题

2. **配置文件说明**
   - `~/.docker/config.json`: Docker 客户端配置文件
   - `/etc/docker/daemon.json`: Docker 守护进程配置文件（在 Colima VM 中）

3. **注意事项**
   - 确保使用最新版本的 Colima 和 Docker
   - 如果更改配置后仍然无法拉取镜像，可以尝试完全重置 Colima
   - 配置更改后需要重启 Docker 守护进程才能生效

## 故障排除

如果仍然遇到问题，可以尝试以下步骤：

1. 检查 Docker 配置是否生效：
```bash
docker info | grep "Registry Mirrors" -A 5
```

2. 检查网络连接：
```bash
colima ssh -- ping registry-1.docker.io
```

3. 如果需要使用代理：
```bash
# 在 ~/.colima/default/colima.yaml 中添加代理配置
docker:
  env:
    HTTPS_PROXY: "http://proxy.example.com:port"
    HTTP_PROXY: "http://proxy.example.com:port"
    NO_PROXY: "localhost,127.0.0.1"
```

## 参考链接

- [Colima 官方文档](https://github.com/abiosoft/colima)
- [Docker 镜像加速](https://docker.hlmirror.com/)
- [Docker 配置文档](https://docs.docker.com/config/daemon/) 