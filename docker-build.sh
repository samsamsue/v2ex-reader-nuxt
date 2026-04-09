#!/bin/bash

# 强制删除旧容器（如果有的话）
docker rm -f v2nuxt || true

# 构建镜像
docker build -t v2nuxt .

# 给镜像打标签
docker tag v2nuxt yiroon/v2nuxt:latest

# 推送到远程仓库
docker push yiroon/v2nuxt:latest