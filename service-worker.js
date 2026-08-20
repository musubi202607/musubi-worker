const CACHE_NAME = "musubi-pwa-v1.1";


const CACHE_FILES = [

  "./css/style.css",

  "./js/app.js",

  "./js/config.js",

  "./manifest.json",

  "./offline.html"

];



// =========================
// Install
// =========================
self.addEventListener(
  "install",
  event => {


    event.waitUntil(

      caches.open(
        CACHE_NAME
      )
      .then(cache => {

        return cache.addAll(
          CACHE_FILES
        );

      })

    );


    self.skipWaiting();


  }
);



// =========================
// Activate
// =========================
self.addEventListener(
  "activate",
  event => {


    event.waitUntil(

      caches.keys()
      .then(keys => {


        return Promise.all(

          keys.map(key=>{


            if(
              key !== CACHE_NAME
            ){

              return caches.delete(
                key
              );

            }


          })

        );


      })

    );


    self.clients.claim();


  }
);



// =========================
// Fetch
// =========================
self.addEventListener(
  "fetch",
  event => {


    const url =
      new URL(
        event.request.url
      );



    // =====================
    // APIは常に最新取得
    // =====================
    if(

      url.hostname.includes(
        "workers.dev"
      )

      ||

      url.hostname.includes(
        "script.google.com"
      )

    ){

      return;

    }



    // =====================
    // HTMLはキャッシュしない
    // =====================
    if(
      event.request.headers.get(
        "accept"
      )?.includes(
        "text/html"
      )
    ){

      event.respondWith(

  fetch(
    event.request
  )
  .catch(()=>{


    return caches.match(
      "./offline.html"
    );


  })

);

      return;

    }




    // =====================
    // CSS / JSなど
    // Cache First
    // =====================
    event.respondWith(

      caches.match(
        event.request
      )
      .then(response=>{


        return (

          response

          ||

          fetch(
            event.request
          )

        );


      })

    );


  }
);