let kitchenProducts = [];
let kitchenCart = [];


// =========================
// 初期化
// =========================
window.addEventListener(
  "DOMContentLoaded",
  async ()=>{

    await loadKitchenProducts();

  }
);


// =========================
// 商品取得
// =========================
async function loadKitchenProducts(){

  try{

    const res =
      await fetch(
        API_URL +
        "/api/products"
      );


    const data =
      await res.json();


    kitchenProducts = data
  .filter(item =>
    item.status === "販売中" &&
    item.kitchenCar === "○"
  )
  .sort((a, b) =>
    Number(a.kitchenSort || 9999) -
    Number(b.kitchenSort || 9999)
  );

    displayKitchenProducts();


  }catch(error){

    console.error(
      "商品取得エラー",
      error
    );

  }

}



// =========================
// 商品表示
// =========================
function displayKitchenProducts(){

  const area =
    document.getElementById(
      "kitchenProductGrid"
    );


  if(!area){

    return;

  }


  area.innerHTML = "";


  kitchenProducts.forEach(product=>{


    area.innerHTML += `

<div class="shop-info-card">

<h2>

${product.name}

</h2>


<p>

¥${Number(product.kitchenPrice || product.price).toLocaleString()}

</p>



<div class="qty-area">


<button

style="
font-size:24px;
padding:10px 20px;
"

onclick="
changeKitchenQty(
${product.id},
-1
)
"

>

－

</button>



<span

id="kqty_${product.id}"

style="
font-size:24px;
margin:0 20px;
"

>

0

</span>



<button

style="
font-size:24px;
padding:10px 20px;
"

onclick="
changeKitchenQty(
${product.id},
1
)
"

>

＋

</button>


</div>


</div>

`;

  });


}



// =========================
// 数量変更
// =========================
function changeKitchenQty(

  id,

  diff

){


  const target =
    document.getElementById(
      "kqty_" + id
    );


  if(!target){

    return;

  }


  let qty =
    Number(target.innerText)
    +
    diff;



  if(qty < 0){

    qty = 0;

  }



  target.innerText =
    qty;



  const item =
    kitchenCart.find(
      x =>
      x.id === id
    );



  if(item){

    item.qty =
      qty;

  }else{

    kitchenCart.push({

      id:id,

      qty:qty

    });

  }



  kitchenCart =
    kitchenCart.filter(
      x =>
      x.qty > 0
    );



  displayKitchenCart();


}



// =========================
// カート表示
// =========================
function displayKitchenCart(){

  const area =
    document.getElementById(
      "kitchenCart"
    );


  if(!area){

    return;

  }


  area.innerHTML = "";


  let total = 0;



  kitchenCart.forEach(item=>{


    const product =
      kitchenProducts.find(
        p =>
        p.id == item.id
      );



    if(!product){

      return;

    }



    const amount =

      Number(product.kitchenPrice || product.price)

      *

      Number(item.qty);



    total += amount;



    area.innerHTML += `

<div>

${product.name}

×

${item.qty}

個

¥${amount.toLocaleString()}

</div>

`;

  });



  document.getElementById(
    "totalPrice"
  ).innerText =

    "¥" +
    total.toLocaleString();


}



// =========================
// 注文送信
// =========================
async function sendKitchenOrder(){


  if(
    kitchenCart.length === 0
  ){

    alert(
      "商品を選択してください"
    );

    return;

  }



  const carNumber =
document.getElementById(
"carNumber"
).value;


const paymentStatus =
document.getElementById(
"paymentStatus"
).value;


const orders =

    kitchenCart.map(item=>{


      const product =

        kitchenProducts.find(

          p =>
          p.id == item.id

        );

      return {

        productName:
          product.name,

        qty:
          item.qty,

        price:
          product.kitchenPrice || product.price,

        amount:

          Number(product.kitchenPrice || product.price)

          *

          Number(item.qty)

      };

    });

  try{

    const res =

      await fetch(

        API_URL +
        "/api/kitchen/order",

        {

          method:"POST",

          headers:{

            "Content-Type":
            "application/json"

          },


          body:

JSON.stringify({

  carNumber,

  paymentStatus,

  orders

})

        }

      );



    const result =

      await res.json();



    if(result.success){


      document.getElementById(
        "resultArea"
      ).innerHTML =

      `

<div class="shop-info-card">

<h2>

受付完了

</h2>


<p>

注文番号：

<br>

${result.orderNo}

</p>


</div>

`;



      kitchenCart = [];


      displayKitchenCart();



      document

      .querySelectorAll(
        "[id^='kqty_']"
      )

      .forEach(el=>{

        el.innerText = 0;

      });



    }else{


      alert(

        result.message ||

        "注文失敗"

      );


    }



  }catch(error){


    console.error(
      error
    );


    alert(
      "通信エラー"
    );


  }


}
