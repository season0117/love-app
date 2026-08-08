# 恋爱记 App - Docker 部署
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制全部源码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 8080
ENV PORT=8080

# 启动
CMD ["node", "backend/server.js"]
