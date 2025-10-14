# Node.jsの公式イメージを使う
FROM node:20

# コンテナ内での作業ディレクトリを作成
WORKDIR /app

# 依存関係のインストールを先に行う
COPY package*.json ./
RUN npm install

# アプリの全ファイルをコンテナにコピーします
# (この時、ローカルのpublicフォルダもコピーされます)
COPY . .

# ポートを開放
EXPOSE 3000

# コンテナ起動時に実行するコマンド
CMD ["node", "server.js"]