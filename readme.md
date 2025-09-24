# github の基本操作方法

### 作業する前にすること
## クローン(コードのコピー)
git clone https://github.com/nitr0yukkuri/umekita_tech_base
↑これをターミナルに打つと　現時点のgithubにあるコードをローカルに置いて操作するようにできるやつ
## プル(既に存在してるコードを読み込み)
git pull origin main
↑一回クローンしてこのコードをうつと最新の変更を反映するやつ
## ブランチ(枝分かれコピー)
git checkout -b "やることをここに入力"
branchの作成と移動を両方するやつ
↑作業前はこれ必須
git branch 
現時点のブランチの場所とブランチ一覧が見れる
*が現時点のブランチ地点
 
### 作業後にすること
git add 
githubにプッシュするファイルやコードを選ぶやつ
基本は git add . (全選択するやつ)でおｋ

git commit -m "ここにコミットメッセージ"
変更内容を確定して記録するやつ
コミットメッセージはやったことを書こう！

git push origin ブランチ名
変更したものをgithubに送り、リクエストするやつ
