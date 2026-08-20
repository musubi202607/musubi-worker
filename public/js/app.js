// =========================
// 店舗情報取得
// =========================
async function loadShopSettings(){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/shop-settings"

      );


    const shop =
      await res.json();



    // =========================
    // テキスト設定
    // =========================

    const shopName =
      document.getElementById(
        "shopName"
      );

    if(shopName){

      shopName.textContent =
        shop.shopName || "";

    }



    const phone =
      document.getElementById(
        "phone"
      );

    if(phone){

      phone.textContent =
        shop.phone || "";

    }



    const address =
      document.getElementById(
        "address"
      );

    if(address){

      address.textContent =
        shop.address || "";

    }



    const businessHours =
      document.getElementById(
        "businessHours"
      );

    if(businessHours){

      businessHours.textContent =
        shop.businessHours || "";

    }



    // =========================
    // 臨時休業
    // shop_settings
    // holidayList
    // =========================

    const holidayList =
      document.getElementById(
        "holidayList"
      );

    if(holidayList){

      holidayList.textContent =
        shop.holidayList || "";

    }



    // =========================
    // 画像
    // =========================

    const topImage =
      document.getElementById(
        "topImage"
      );

    if(topImage && shop.topImage){

      topImage.src =
        shop.topImage;

    }



    const shopImage1 =
      document.getElementById(
        "shopImage1"
      );

    if(shopImage1 && shop.shopImage1){

      shopImage1.src =
        shop.shopImage1;

    }



    const shopImage2 =
      document.getElementById(
        "shopImage2"
      );

    if(shopImage2 && shop.shopImage2){

      shopImage2.src =
        shop.shopImage2;

    }



    const shopImage3 =
      document.getElementById(
        "shopImage3"
      );

    if(shopImage3 && shop.shopImage3){

      shopImage3.src =
        shop.shopImage3;

    }



    // =========================
    // 外部リンク
    // =========================

    const instagram =
      document.getElementById(
        "instagram"
      );

    if(instagram){

      instagram.href =
        shop.instagram || "#";

    }



    const line =
      document.getElementById(
        "line"
      );

    if(line){

      line.href =
        shop.line || "#";

    }



    const googleMap =
      document.getElementById(
        "googleMap"
      );

    if(googleMap){

      googleMap.href =
        shop.googleMap || "#";

    }



    // =========================
    // お知らせ
    // =========================

    const notice1 =
      document.getElementById(
        "notice1"
      );

    if(notice1){

      notice1.textContent =
        shop.notice1 || "";

    }



    const notice2 =
      document.getElementById(
        "notice2"
      );

    if(notice2){

      notice2.textContent =
        shop.notice2 || "";

    }



    const notice3 =
      document.getElementById(
        "notice3"
      );

    if(notice3){

      notice3.textContent =
        shop.notice3 || "";

    }



    // =========================
    // フッター
    // =========================

    const footerShopName =
      document.getElementById(
        "footerShopName"
      );

    if(footerShopName){

      footerShopName.textContent =
        shop.shopName || "";

    }



    const footerPhone =
      document.getElementById(
        "footerPhone"
      );

    if(footerPhone){

      footerPhone.textContent =
        shop.phone || "";

    }



    const footerBusinessHours =
      document.getElementById(
        "footerBusinessHours"
      );

    if(footerBusinessHours){

      footerBusinessHours.textContent =
        shop.businessHours || "";

    }



  }catch(error){

    console.error(

      "店舗情報取得エラー",

      error

    );

  }

}



// =========================
// 次回・次々回店休日取得
// =========================
async function loadNextHoliday(){

  try{


    const res =
      await fetch(

        API_URL +
        "/api/store-business-calendar"

      );



    const holidays =
      await res.json();



    // =========================
    // データ確認
    // =========================
    if(!Array.isArray(holidays)){


      console.error(

        "店休日データ形式エラー",

        holidays

      );


      return;


    }




    const today =
      new Date();



    const todayText =

      today.getFullYear() +

      "-" +

      String(
        today.getMonth()+1
      ).padStart(2,"0") +

      "-" +

      String(
        today.getDate()
      ).padStart(2,"0");





    const nextHolidays =

      holidays

        .filter(item=>{


          return (

            item.status === "店休日" &&

            item.date > todayText

          );


        })

        .sort((a,b)=>{


          return (

            a.date.localeCompare(
              b.date
            )

          );


        })

        .slice(0,2);





    const texts =

      nextHolidays.map(item=>{


        const parts =

          item.date.split("-");



        return (

          Number(parts[1]) +

          "月" +

          Number(parts[2]) +

          "日"

        );


      });





    let holidayText = "";





    if(texts.length >= 1){


      holidayText +=

        "次回店休日：" +

        texts[0];


    }





    if(texts.length >= 2){


      holidayText +=

        "<br>" +

        "次々回店休日：" +

        texts[1];


    }





    const holiday =

      document.getElementById(

        "holidayText"

      );



    if(holiday){


      holiday.innerHTML =

        holidayText;


    }





    const footerHoliday =

      document.getElementById(

        "footerHolidayText"

      );



    if(footerHoliday){


      footerHoliday.innerHTML =

        holidayText;


    }



  }
  catch(error){


    console.error(

      "店休日取得エラー",

      error

    );


  }


}

// =========================
// 商品一覧表示
// =========================
async function loadProducts(){

  const products =
    await loadProductsCache();


  const onigiri =
  products.filter(

    p =>
      p.type === "onigiri" &&
      p.status === "販売中" &&
      p.store === "○"

  );


  const grid =
    document.getElementById(
      "productGrid"
    );


  if(!grid){

    return;

  }


  grid.innerHTML = "";



  onigiri.forEach(product=>{


    grid.innerHTML += `

<div class="product-card">


<img

src="${product.image}"

alt="${product.name}"

>


<div class="product-content">


<h3>

${product.name}

</h3>



<p>

${product.description || ""}

</p>



<div class="price">

¥${Number(product.price).toLocaleString()}

</div>



<div class="qty-area">


<button

class="qty-btn"

onclick="changeQty(${product.id},-1)"

>

－

</button>



<span

id="qty-${product.id}"

class="qty-value"

>

1

</span>



<button

class="qty-btn"

onclick="changeQty(${product.id},1)"

>

＋

</button>


</div>



<button

onclick="addToCartQty(${product.id})"

>

カートへ追加

</button>



</div>


</div>

`;

  });


}



// =========================
// 数量変更
// =========================
function changeQty(

  productId,

  diff

){


  const target =

    document.getElementById(

      "qty-" +
      productId

    );



  if(!target){

    return;

  }



  let qty =

    Number(

      target.innerText

    );



  qty += diff;



  if(qty < 1){

    qty = 1;

  }



  target.innerText =

    qty;


}



// =========================
// カート追加
// =========================
async function addToCartQty(

  productId

){


  const qty =

    Number(

      document.getElementById(

        "qty-" +
        productId

      ).innerText

    );



  await addToCart(

    productId,

    qty

  );



  const target =

    document.getElementById(

      "qty-" +
      productId

    );



  if(target){

    target.innerText = 1;

  }


}



// =========================
// カート件数更新
// =========================
async function updateCartCount(){


  try{


    const cart =

      await getCart();



    const cartCount =

      document.getElementById(

        "cartCount"

      );



    if(!cartCount){

      return;

    }



    const count =

      cart.reduce(

        (sum,item)=>{

          return (

            sum +
            Number(item.qty)

          );

        },

        0

      );



    cartCount.innerText =

      count;



  }catch(error){


    console.error(

      "カート件数取得エラー",

      error

    );


  }


}

// =========================
// 初期表示
// =========================
window.addEventListener(

  "DOMContentLoaded",

  async ()=>{


    await loadShopSettings();


    await loadNextHoliday();


    await loadProducts();


    await updateCartCount();


  }

);

// =========================
// PWA Service Worker登録
// =========================
if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker.register(
        "service-worker.js"
      )
      .then(() => {

        console.log(
          "Service Worker 登録完了"
        );

      })
      .catch(error => {

        console.error(
          "Service Worker 登録失敗",
          error
        );

      });

    }
  );

}
