# IB Skill Exchange

IB生徒が同じクラス内で得意をレッスンとして出品・予約し、受講完了後にコインを移動するリアルタイム・スキルシェアMVPです。

## フォルダ構成

```text
src/components    # 再利用UI（ナビゲーション、カード、ローディング）
src/contexts      # Firebase認証とトースト通知の状態
src/hooks         # Firestore購読用フック
src/pages         # 各画面
src/services      # Auth/Firestore の読み書き・決済トランザクション
src/constants     # カテゴリーとクラス
src/types         # ドメイン定数とFirestoreスキーマの注釈
```

## Firestore データ設計

| Collection | 主なフィールド |
| --- | --- |
| `users/{uid}` | `uid`, `username`, `email`, `classId`, `currentCoins`, `contributionCoins`, `monthlyContributionCoins`, `monthlyContributionKey`, `createdAt` |
| `skills/{id}` | `userId`, `sellerName`, `classId`, `title`, `subject`, `category`, `description`, `price`, `duration`, `availableTime`, `isActive`, `createdAt` |
| `bookings/{id}` | `buyerId`, `sellerId`, 両者名、`skillId`, `skillTitle`, `classId`, `price`, `duration`, `availableTime`, `bookingTime`, `status`, `completedAt` |
| `histories/{id}` | `userId`, `classId`, `type`, `amount`, `description`, `bookingId`, `createdAt` |
| `notifications/{id}` | `userId`, `title`, `message`, `isRead`, `createdAt` |
| `classes/{id}` | `className`, `members`, `createdAt` |

スキル・予約に `classId` と必要な表示情報を保存することで、クラス単位の検索と表示が参照一回で完結します。`completeLesson` は Firestore transaction を使い、残高、貢献度、完了ステータス、双方の履歴をまとめて書き込みます。月初の最初の完了時に月間貢献値をリセットします。

## 環境構築

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` に Firebase コンソールの値を設定してください。`.env` は `.gitignore` 済みでコミットされません。

## Firebase プロジェクト設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成し、Web アプリを追加します。
2. Authentication → Sign-in method で **メール/パスワード** を有効化します。
3. Firestore Database を Production mode で作成します。
4. Firebase CLI を使いルールとインデックスを反映します。

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore
```

`firestore.rules` はこのクライアント完結MVPが動作する権限を定義しています。本番運用では不正な残高操作を完全に防ぐため、`completeLesson` を Cloud Functions / Cloud Run の認証済みAPIへ移し、クライアントからの `users` 残高・`histories` 作成を拒否してください。

## GitHub へ Push

```bash
git init
git add .
git commit -m "feat: build IB Skill Exchange MVP"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Vercel へデプロイ

1. GitHub リポジトリを Vercel で Import します（Framework Preset: Vite）。
2. Project Settings → Environment Variables に `.env` と同じ `VITE_FIREBASE_*` を登録します。
3. Deploy を実行します。
4. Firebase Authentication → Settings → Authorized domains に Vercel のドメインを追加します。

Build command は `npm run build`、出力先は `dist` です。Firestore のリアルタイムリスナーにより、スキル、予約、プロフィール、ランキング、残高、履歴は複数端末間で自動同期されます。
