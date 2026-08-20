// =========================
// 商品データ
// =========================

let products = [];


// =========================
// 注文データ
// =========================

let cart = [];


// =========================
// 二重送信防止
// =========================

let isSubmitting = false;


// =========================
// 初期化
// =========================

window.onload = async () => {

  await loadProducts();

};


// =========================
// 商品取得
// =========================

async function loadProducts(){

  try{

    const response =
      await fetch(
        API_URL + "/api/products"
      );


    const data =
      await response.json();


    products = data
      .filter(item =>
        item.id &&
        item.status === "販売中" &&
        item.staff === "○" &&
        (
          item.type === "onigiri" ||
          item.type === "drink"
        )
      )
      .sort(
        (a,b) =>
          Number(a.sort || 9999) -
          Number(b.sort || 9999)
      );


    renderProducts();

    updateTotal();


  }catch(err){

    console.error(err);

    alert(
      "商品取得に失敗しました"
    );

  }

}


// =========================
// 商品表示
// =========================

function renderProducts(){

  const list =
    document.getElementById(
      "productList"
    );


  let html = "";


  // =========================
  // おにぎり
  // =========================

  const onigiri =
    products.filter(
      p => p.type === "onigiri"
    );


  if(onigiri.length){

    html += `

      <div class="category-title">

        🍙 おにぎり

      </div>

    `;


    onigiri.forEach(item=>{

      html +=
        createProductCard(item);

    });

  }


  // =========================
  // ドリンク
  // =========================

  const drinks =
    products.filter(
      p => p.type === "drink"
    );


  if(drinks.length){

    html += `

      <div class="category-title">

        🥤 ドリンク

      </div>

    `;


    drinks.forEach(item=>{

      html +=
        createProductCard(item);

    });

  }


  list.innerHTML = html;

}

// =========================
// 商品カード
// =========================

function createProductCard(item){

  return `

<div
  class="staff-product"
  id="card_${item.id}"
  onclick="cardClick(event, ${item.id})"
>

  <div class="staff-product-name">

    ${item.name}

  </div>


  <div class="staff-product-price">

    ${Number(item.price).toLocaleString()}円

  </div>


  <div class="qty-area">

    <button
      class="qty-btn"
      onclick="changeQty(${item.id}, -1)"
    >

      −

    </button>


    <div
      class="qty-number qty-zero"
      id="qty_${item.id}"
    >

      0

    </div>


    <button
      class="qty-btn"
      onclick="changeQty(${item.id}, 1)"
    >

      ＋

    </button>


  </div>


</div>

`;

}


// =========================
// 数量変更
// =========================

function changeQty(id, diff){


  let item =
    cart.find(
      x => x.id === id
    );


  if(!item){


    if(diff < 0){

      return;

    }


    const product =
      products.find(
        x => x.id === id
      );


    item = {

      id:
        product.id,

      name:
        product.name,

      price:
        Number(product.price),

      qty:
        0

    };


    cart.push(item);


  }


  item.qty += diff;


  if(item.qty < 0){

    item.qty = 0;

  }


  cart =
    cart.filter(
      x => x.qty > 0
    );



  const qtyLabel =
    document.getElementById(
      "qty_" + id
    );


  const card =
    document.getElementById(
      "card_" + id
    );



  qtyLabel.textContent =
    item.qty;



  qtyLabel.classList.remove(
    "qty-pop"
  );


  void qtyLabel.offsetWidth;


  qtyLabel.classList.add(
    "qty-pop"
  );



  if(item.qty === 0){


    qtyLabel.classList.add(
      "qty-zero"
    );


    card.classList.remove(
      "selected"
    );


  }else{


    qtyLabel.classList.remove(
      "qty-zero"
    );


    card.classList.add(
      "selected"
    );


  }


  updateTotal();


}


// =========================
// 商品カードクリック
// =========================

function cardClick(event,id){


  // ＋－ボタン押下時は
  // カードクリック処理をしない

  if(
    event.target.closest("button")
  ){

    return;

  }


  changeQty(
    id,
    1
  );


}

// =========================
// 合計更新
// =========================

function updateTotal(){

  let total = 0;

  let count = 0;


  cart.forEach(item=>{


    total +=
      item.price * item.qty;


    count +=
      item.qty;


  });



  document.getElementById(
    "totalPrice"
  ).textContent =
    total.toLocaleString();



  document.getElementById(
    "totalCount"
  ).textContent =
    count + "点";


}



// =========================
// 注文登録
// =========================

async function submitStaffOrder(){


  // =========================
  // 二重送信防止
  // =========================

  if(isSubmitting){

    console.log(
      "注文処理中"
    );

    return;

  }


  const items =
    cart.map(item => ({


      productId:
        item.id,


      name:
        item.name,


      price:
        item.price,


      quantity:
        item.qty,


      amount:
        item.price * item.qty


    }));





  if(items.length === 0){


    alert(
      "商品を選択してください"
    );


    return;


  }



  isSubmitting = true;



  const body = {


    name:
      document.getElementById(
        "customerName"
      ).value,


    note:
      document.getElementById(
        "note"
      ).value,


    unpaid:
      document.getElementById(
        "unpaidCheck"
      ).checked,


    items


  };



  try{


    const res =
      await fetch(

        API_URL +
        "/api/staff-order",

        {

          method:"POST",


          headers:{


            "Content-Type":
              "application/json"


          },


          body:
            JSON.stringify(body)


        }

      );



    const result =
      await res.json();



    if(result.success){


      showComplete(
        result.orderNo
      );


    }else{


      alert(

        result.message ||
        "登録失敗"

      );


    }



  }catch(e){


    console.error(e);


    alert(
      "通信エラー"
    );


  }
  finally{


    // 必ず解除

    isSubmitting = false;


  }


}

// =========================
// 完了画面表示
// =========================

function showComplete(orderNo){


  document.getElementById(
    "completeOrderNo"
  ).textContent =
    orderNo;



  document.getElementById(
    "completeModal"
  ).style.display =
    "flex";


}


// =========================
// 次の注文
// =========================

function resetOrder(){


  document.getElementById(
    "completeModal"
  ).style.display =
    "none";



  // カート初期化

  cart = [];



  products.forEach(item => {


    const qty =
      document.getElementById(
        "qty_" + item.id
      );


    if(qty){


      qty.textContent =
        0;


      qty.classList.add(
        "qty-zero"
      );


    }



    const card =
      document.getElementById(
        "card_" + item.id
      );


    if(card){


      card.classList.remove(
        "selected"
      );


    }


  });



  updateTotal();



  document.getElementById(
    "customerName"
  ).value = "";



  document.getElementById(
    "note"
  ).value = "";



  document.getElementById(
    "unpaidCheck"
  ).checked = false;


}

