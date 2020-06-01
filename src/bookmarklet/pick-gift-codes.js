// Gmail から nanaco ギフトのコードを取り出すブックマークレット

(function () {
  const anchorList = [...document.querySelectorAll('a')];
  const nanacoGiftIds = anchorList.map(anchor => anchor.href)
    .filter(href => href.includes('emServlet?gid'))
    .map(nanacoGiftLink => nanacoGiftLink.match(/gid=([a-zA-Z\d]{16})$/)[1]);

  console.log(nanacoGiftIds);
  prompt('yarn run start に渡す', nanacoGiftIds.join(','));
})();
