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


