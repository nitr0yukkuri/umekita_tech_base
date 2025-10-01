# github の基本操作方法

# 作業する前にすること
## クローン(コードのコピー)
git clone https://github.com/nitr0yukkuri/umekita_tech_base
→ 現時点のGitHubにあるコードをローカルにコピーする

## プル(既に存在してるコードを読み込み)
git pull origin main
→ 最新の変更を反映する

## ブランチ(枝分かれコピー)
### 新しく作業ブランチを作るとき
git checkout -b "やることをここに入力"
→ branchの作成と移動を同時にする

### 既存のブランチに移動するとき
git checkout ブランチ名

git branch 
→ 現在地とブランチ一覧が見れる  
（* が付いているのが現在のブランチ）

# 作業後にすること
## ステージング
git add .
→ 変更したファイルを全て選択（ステージング）

## コミット
git commit -m "ここにコミットメッセージ"
→ 変更を確定して記録  
（コミットはこまめに分けるとバグ対応が楽）

## プッシュ
git push origin ブランチ名
→ 変更をGitHubに送る
# ファイル構成
## HTML
- `title.html`: トップページ。ここから「レシピを作る」か「闇ガチャを回す」かを選択する画面
- `material-input.html`: 「レシピを作る」を選択したときの材料入力画面
- `surotto.html`: 材料からレシピを生成するスロットゲーム画面
- `gacha.html`: 「闇ガチャを回す」を選択したときのガチャ画面。
- `amazing-cooking-screen.html`: ガチャで当たりが出たときの結果画面

## CSS (front/css)
- `common.css`: 全てのページ(surotto.html以外)に共通するスタイルが定義しているよ
- `title.css`: トップページ(`title.html`)のスタイル。
- `material-input.css`: 材料入力画面(`material-input.html`)のスタイル。
- `surotto.css`: スロットゲーム画面(`surotto.html`)のスタイル。
- `gacha.css`: ガチャ画面(`gacha.html`)のスタイル。
- `amazing-cooking-screnn.css`: ガチャ結果画面(`amazing-cooking-screen.html`)のスタイル。

## JavaScript (front/js)
- `title.js`: トップページ(`title.html`)のボタンの画面遷移を制御
- `material-input.js`: 材料入力画面(`material-input.html`)で材料の追加・削除などの動的な処理を制御
- `surotto.js`: スロットゲームのロジックを制御します。リールの回転や停止、結果の判定などをしている
- `gacha.js`: ガチャ画面(`gacha.html`)のボタンが押されたときにガチャを実行し、結果画面に遷移している
- `amazing-cooking-screnn.js`: ガチャ結果画面(`amazing-cooking-screen.html`)でSNS共有ボタンの機能を制御します。

## 画像 (img)
- `haikei.png`: スロットゲーム画面の背景画像です。
- `gacha.png`: ガチャ画面のガチャマシンの画像です。
- `1402858_s.jpg`: ガチャの結果画面で表示される料理の画像です。

