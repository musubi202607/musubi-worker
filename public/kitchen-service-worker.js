const CACHE_NAME =
"musubi-kitchen-v4";


const CACHE_FILES = [

"kitchen-index.html",

"kitchen.html",

"kitchen-unpaid.html",

"kitchen-sales.html",

"css/style.css",

"js/config.js",

"js/kitchen-index.js",

"js/kitchen.js",

"js/kitchen-unpaid.js",

"js/kitchen-sales.js",

"kitchen-manifest.json"

];


// =========================
// インストール
// =========================
self.addEventListener(

"install",

event=>{

event.waitUntil(

caches.open(
CACHE_NAME
)

.then(

cache=>

cache.addAll(
CACHE_FILES
)

)

.then(()=>{

return self.skipWaiting();

})

);

}

);


// =========================
// 古いキャッシュ削除
// =========================
self.addEventListener(

"activate",

event=>{

event.waitUntil(

caches.keys()

.then(

keys=>{

return Promise.all(

keys.map(

key=>{

if(
key !== CACHE_NAME
){

return caches.delete(
key
);

}

}

)

);

}

)

.then(()=>{

return self.clients.claim();

})

);

}

);


// =========================
// 通信
// =========================
self.addEventListener(

"fetch",

event=>{


event.respondWith(

fetch(
event.request
)

.then(

response=>{

return response;

}

)

.catch(

()=>{

return caches.match(
event.request
);

}

)

);


}

);
