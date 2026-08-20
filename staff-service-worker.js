const CACHE_NAME = "musubi-staff-v4";

const FILES = [
  "staff.html",
  "staff-order.html",
  "staff-bbq.html",
  "bbq-option.html",
  "payment-waiting.html",
  "css/style.css",
  "js/config.js",
  "js/staff-auth.js",
  "js/staff-order.js",
  "js/bbq.js",
  "js/bbq-tablet.js"
];

// =========================
// インストール
// =========================
self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())

  );

});

// =========================
// 古いキャッシュ削除
// =========================
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys =>

        Promise.all(

          keys.map(key => {

            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }

          })

        )

      )
      .then(() => self.clients.claim())

  );

});

// =========================
// 通信（ネットワーク優先）
// =========================
self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)

      .then(response => response)

      .catch(() => caches.match(event.request))

  );

});
