function sendLineOrder() {

  const message = encodeURIComponent('新しい注文が入りました');

  const lineUrl = `https://line.me/R/msg/text/?${message}`;

  window.open(lineUrl);
}