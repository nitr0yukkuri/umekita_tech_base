# Node.jsの公式イメージを使う
FROM node:20

# 作業ディレクトリを作成
WORKDIR /app

# 依存関係のインストール
# backフォルダの中のpackage.jsonをコピーする
COPY back/package*.json ./
RUN npm install

# アプリのコードをコピー
# プロジェクトの全ファイルをコピーする
COPY . .

# ポートを開放
EXPOSE 3000

# アプリを起動
# backフォルダの中のserver.jsを実行する
CMD ["node", "back/server.js"]