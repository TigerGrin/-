#!/bin/bash

# Sealos 部署脚本
# 用于快速构建和部署应用到 Sealos

set -e

echo "🚀 开始构建和部署流程..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量（请根据实际情况修改）
IMAGE_NAME="hospital-schedule-system"
IMAGE_TAG="latest"
REGISTRY=""  # 您的镜像仓库地址，例如：docker.io/your-username 或 registry.cn-hangzhou.aliyuncs.com/your-namespace

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

echo -e "${YELLOW}📦 步骤 1: 构建 Docker 镜像...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi

echo -e "${GREEN}✅ 镜像构建成功${NC}"

# 如果提供了镜像仓库地址，则推送镜像
if [ -n "$REGISTRY" ]; then
    echo -e "${YELLOW}📤 步骤 2: 推送镜像到仓库...${NC}"
    FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${FULL_IMAGE_NAME}
    docker push ${FULL_IMAGE_NAME}
    
    if [ $? -ne 0 ]; then
        echo "❌ 镜像推送失败"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 镜像推送成功: ${FULL_IMAGE_NAME}${NC}"
    echo ""
    echo "📝 请在 Sealos 应用管理中使用以下镜像地址："
    echo "   ${FULL_IMAGE_NAME}"
else
    echo -e "${YELLOW}⚠️  未配置镜像仓库地址，跳过推送步骤${NC}"
    echo ""
    echo "📝 本地镜像已构建完成：${IMAGE_NAME}:${IMAGE_TAG}"
    echo "   如需推送到仓库，请修改脚本中的 REGISTRY 变量"
fi

echo ""
echo -e "${GREEN}🎉 构建完成！${NC}"
echo ""
echo "📖 下一步："
echo "   1. 登录 Sealos 平台"
echo "   2. 进入应用管理，创建新应用"
echo "   3. 使用上述镜像地址部署应用"
echo "   4. 开启公网访问，获取访问链接"
echo ""
echo "   详细步骤请参考：Sealos部署指南.md"

