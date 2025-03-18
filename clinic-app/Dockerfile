# Step 1: 使用带有 Node.js 的基础镜像
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json（如果可用）
COPY ./package.json ./

# 安装项目依赖
RUN npm install --only=production

# 安装 nest CLI 工具（确保它作为项目依赖被安装）
RUN npm install @nestjs/cli -g

# 复制所有文件到容器中
COPY . .

# 构建应用程序
RUN npm run build

# Step 2: 运行时使用更精简的基础镜像
FROM node:18-alpine

# 创建 runc 的符号链接
RUN ln -s /sbin/runc /usr/bin/runc

WORKDIR /usr/src/app

# 从 builder 阶段复制构建好的文件
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# 暴露 3000 端口
EXPOSE 3000

# 运行 Nest.js 应用程序
CMD ["node", "dist/main"]
