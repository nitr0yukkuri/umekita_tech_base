# Node.jsの公式イメージを使う
FROM node:20

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリのコードをコピー
COPY . .

# ポートを開放
EXPOSE 3000

# アプリを起動
CMD ["npm", "start"]
