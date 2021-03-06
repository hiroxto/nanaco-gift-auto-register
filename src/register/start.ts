import puppeteer, { NavigationOptions, WaitForSelectorOptions } from 'puppeteer';

require('dotenv').config();

const loginUrl = 'https://www.nanaco-net.jp/pc/emServlet';
const NANACO_NUMBER = process.env.NANACO_NUMBER;
const NANACO_SECURITY_CODE = process.env.NANACO_SECURITY_CODE;
const SPLIT_BY = +process.env.SPLIT_BY;

// ページ移動時に使うオプション
const navigationOptions: NavigationOptions = {
  waitUntil: ['load', 'networkidle2'],
};

const waitForSelectorOptions: WaitForSelectorOptions = {
  visible: true,
};

const buildLoginUrl = (giftCode: string) : string => `${loginUrl}?gid=${giftCode}`;

/**
 * コマンドの引数からnanacoギフトを取り出す
 * @param processArgs process.argsの値
 */
const getNanacoGiftIDs = (processArgs: string[]) : string[] => processArgs.slice(2);

/**
 * ギフトIDを分割する
 * @param ids 分割する配列
 * @param splitBy 分割する個数
 */
const splitIDs = (ids: string[], splitBy: number): string[][] => {
  const length = Math.ceil(ids.length / splitBy);
  return new Array(length).fill('').map((_, i) =>
    ids.slice(i * splitBy, (i + 1) * splitBy),
  );
};

/**
 * nanaco ギフトを登録する
 * @param giftId 登録するギフトID. ハイフンは不要.
 */
const registerNanacoGift = async (giftId: string): Promise<void> => {
  const browser = await puppeteer.launch();
  const firstURL = buildLoginUrl(giftId);
  console.log(`Register ${giftId}`);
  const page = await browser.newPage();

  // ログイン処理.
  // ログインページを開いて, nanaco カード番号とセキュリティコードを入力
  console.log(`Go to ${firstURL}`);
  await page.goto(firstURL, navigationOptions);

  console.log('Type nanaco number');
  await page.waitForSelector('input[name="XCID"]', waitForSelectorOptions)
    .then(el => el.type(NANACO_NUMBER));
  console.log('Type security code');
  await page.waitForSelector('input[name="SECURITY_CD"]', waitForSelectorOptions)
    .then(el => el.type(NANACO_SECURITY_CODE));

  // ログイン をクリック
  console.log('Click login');
  await Promise.all([
    page.waitForNavigation(navigationOptions),
    page.waitForSelector('input[name="ACT_ACBS_do_LOGIN2"]', waitForSelectorOptions)
      .then(el => el.click()),
  ]);

  // nanaco ギフト登録 をクリック
  console.log('Click gift register menu');
  await Promise.all([
    page.waitForNavigation(navigationOptions),
    page.waitForSelector('#memberNavi02', waitForSelectorOptions)
      .then(el => el.click()),
  ]);

  // 登録ボタンのフォームから target と onsubmit を削除. 強制的に同じページで開く.
  console.log('Remove form target and onsubmit');
  await page.waitForSelector('form');
  await page.$eval('form', el => {
    el.removeAttribute('target');
    el.removeAttribute('onsubmit');
  });

  // 登録ボタン をクリック
  // 強制的に同じページで開かれるため, ウィンドウの移動は不要
  console.log('Click register button');
  await Promise.all([
    page.waitForNavigation(navigationOptions),
    page.waitForSelector('input[type="image"]', waitForSelectorOptions)
      .then(el => el.click()),
  ]);

  // ギフト ID 登録フォーム
  // ログイン時に gid を指定したためギフト ID は既に入力されている.
  // 登録ページの登録ボタンをクリック.
  console.log('On sub window. Click register button.');
  await Promise.all([
    page.waitForNavigation(navigationOptions),
    page.waitForSelector('#submit-button', waitForSelectorOptions)
      .then(el => el.click()),
  ]);

  // 既に登録済みのギフト ID の場合, 別ページに飛ばされる
  // #error500 の有無を確認して, #error500 が存在した場合は終了する.
  const isErrorPage = await page.$('#error500').then(el => !!el);
  if (isErrorPage) {
    await page.screenshot({ path: `screenshot/error-${giftId}.png`, fullPage: true });
    console.error(`ギフト ID ${giftId} は既に登録されています.`);
    await page.close();
    await browser.close();
  } else {
    await page.screenshot({ path: `screenshot/success00-${giftId}.png`, fullPage: true });
    console.log(`ギフト ID ${giftId} を登録.`);

    // 登録ボタンをクリック
    await Promise.all([
      page.waitForNavigation(navigationOptions),
      page.waitForSelector('input[alt="登録する"]', waitForSelectorOptions)
        .then(el => el.click()),
    ]);

    await page.screenshot({ path: `screenshot/success01-${giftId}.png`, fullPage: true });
    console.log('登録完了');
    await page.close();
    await browser.close();
  }
};

const main = async () => {
  if (process.argv.length <= 2) {
    console.error('引数に nanaco ギフト ID が渡されていません.');
    process.exit(1);
  }

  const giftIDs = getNanacoGiftIDs(process.argv);
  const splitGiftIDs = splitIDs(giftIDs, SPLIT_BY);
  for (let i = 0; i < splitGiftIDs.length; i++) {
    const ids = splitGiftIDs[i];
    await Promise.all(ids.map(async id => await registerNanacoGift(id)));
  }
};

console.log(main());
