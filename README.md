# nanaco-gift-auto-register

nanaco ギフトを完全自動で登録する.

## 使用方法

```bash
$ git clone git@github.com:hiroxto/nanaco-gift-auto-register.git
$ cd nanaco-gift-auto-register
$ yarn install
```

`.env.example` を `.env` へコピーし, nanaco カードの裏に書いてある番号と, ブラウザの同時起動数を設定.

```dotenv
# nanaco カード裏の番号
NANACO_NUMBER="0123456789012345"

# nanaco カード裏のセキュリティコード
NANACO_SECURITY_CODE="0123456"

# ブラウザを同時起動する数
SPLIT_BY=5
```

Gmail のページで `src/bookmarklet/pick-gift-codes.js` のブックマークレットを実行してギフト ID をコピーし `yarn run start` にギフト ID を渡す.

```bash
yarn run start ${giftIds}
```

## License

[MIT License](https://github.com/hiroxto/nanaco-gift-auto-register/blob/master/LICENSE "MIT License")
