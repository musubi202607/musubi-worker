let currentReservation=null;
let reservationCache=[];
let bbqCart=[];
const RESERVATION_KEY="bbqCurrentReservation";

window.addEventListener("DOMContentLoaded",async()=>{
  const area=document.getElementById("productArea");
  if(area) area.style.display="none";

  await loadBbqOptions();
  await loadReservations();

  const saved=localStorage.getItem(RESERVATION_KEY);

  if(saved){
    await searchReservation(saved);
  }else{
    renderCart();
  }
});

function saveReservation(reservation){
  currentReservation=reservation;
  localStorage.setItem(
    RESERVATION_KEY,
    reservation.reservationNo
  );
}

function clearReservation(){

  currentReservation=null;
  bbqCart=[];
  localStorage.removeItem(RESERVATION_KEY);

  const current=document.getElementById("currentReservation");

  if(current){
    current.innerHTML=`
    <div class="empty-state">
    <h2>予約を選択してください</h2>
    <p>左の一覧から予約を選択します。</p>
    </div>`;
  }

  const area=document.getElementById("productArea");
  if(area) area.style.display="none";

  renderReservationList(reservationCache);
  renderCart();
}

function getCartKey(){

  return currentReservation
  ? "bbqOptionCart_"+currentReservation.reservationNo
  : null;

}

function loadCart(){

  const key=getCartKey();

  bbqCart=key
  ? JSON.parse(localStorage.getItem(key))||[]
  : [];

}

function saveCart(){

  const key=getCartKey();

  if(key){
    localStorage.setItem(
      key,
      JSON.stringify(bbqCart)
    );
  }

}

async function loadReservations(){

  try{

    const res=await fetch(
      API_URL+"/api/reservations/today"
    );

    const data=await res.json();

    reservationCache=
      Array.isArray(data)?data:[];

    renderReservationList(
      reservationCache
    );

  }catch(e){

    console.error(e);
    alert("予約取得エラー");

  }

}


function renderReservationList(list){

  const target=
    document.getElementById(
      "reservationList"
    );

  if(!target)return;

  target.innerHTML="";

  if(!list.length){

    target.innerHTML=`
    <div class="product-card">
    <div class="product-content">
    <h3>本日の予約はありません</h3>
    </div>
    </div>`;

    return;

  }

  list.forEach(item=>{

    if(item.paid==="済")return;

    const selected=
      currentReservation &&
      currentReservation.reservationNo===
      item.reservationNo;


    target.innerHTML+=`

    <div class="product-card ${selected?"selected":""}">
    <div class="product-content">

    <h3>${item.customerName}</h3>

    <p>${item.useDate}</p>
    <p>${item.people}名</p>
    <p>${item.plan}</p>
    <p>状態：${item.status||"未"}</p>
    <p>会計：${item.paid||"未"}</p>

    <button class="btn btn-order"
    onclick="searchReservation('${item.reservationNo}')">

    ${selected?"選択中":"この予約を選択"}

    </button>

    </div>
    </div>`;

  });

}

async function searchReservation(reservationNo){

  try{

    const res=await fetch(
      API_URL+
      "/api/bbq/detail?reservationNo="+
      encodeURIComponent(reservationNo)
    );

    const data=await res.json();

    if(!data){
      alert("予約が見つかりません");
      return;
    }

    displayReservation(data);

  }catch(e){

    console.error(e);
    alert("予約取得エラー");

  }

}


async function displayReservation(data){

  saveReservation(data);

  loadCart();

  const history=
    await loadOrderHistory(
      data.reservationNo
    );


  const bbqTotal=
    Number(data.total||0);

  const optionTotal=
    Number(history.total||0);

  const grandTotal=
    bbqTotal+optionTotal;


  let historyHtml="";


  if(
    history.items &&
    history.items.length
  ){

    history.items.forEach(item=>{

      historyHtml+=`

<tr>
<td>${item.itemName}</td>
<td>${item.qty}</td>
<td>
¥${Number(item.amount).toLocaleString()}
</td>
</tr>`;

    });

  }else{

    historyHtml=`
<tr>
<td colspan="3">
追加注文なし
</td>
</tr>`;

  }


  const checkedIn=
    data.status==="来店済";


  document.getElementById(
    "currentReservation"
  ).innerHTML=`

<div class="current-header">

<div class="current-status">
${checkedIn?"受付中":"受付前"}
</div>

<button
class="btn btn-clear"
onclick="changeReservation()">

予約変更

</button>

</div>


<div class="current-name">
${data.customerName} 様
</div>


<div class="current-info">
予約番号：${data.reservationNo}
</div>

<div class="current-info">
利用日：${data.useDate}
</div>

<div class="current-info">
人数：${data.people}名
</div>

<div class="current-info">
プラン：${data.plan}
</div>

<div class="current-info">
状態：${data.status}
</div>


${
checkedIn
?""
:
`
<button
class="btn btn-checkin"
onclick="checkInReservation('${data.reservationNo}')">

受付開始

</button>
`
}


<hr>


<h3>
追加注文履歴
</h3>


<table
style="width:100%;border-collapse:collapse">

<tr>
<th>商品</th>
<th>数量</th>
<th>金額</th>
</tr>

${historyHtml}

</table>


<div class="current-total">

<h3>
ご利用料金
</h3>


<div class="total-row">

<span>
BBQ予約
</span>

<span>
¥${bbqTotal.toLocaleString()}
</span>

</div>


<div class="total-row">

<span>
追加注文
</span>

<span>
¥${optionTotal.toLocaleString()}
</span>

</div>


<hr>


<div class="total-grand">

<span>
合計
</span>

<span>
¥${grandTotal.toLocaleString()}
</span>

</div>

</div>
`;


  renderReservationList(
    reservationCache
  );

  renderCart();


  const area=
    document.getElementById(
      "productArea"
    );


  if(area){

    area.style.display=
      checkedIn
      ?"block"
      :"none";

  }

}



function changeReservation(){

  if(
    !confirm(
      "現在の予約選択を解除しますか？"
    )
  ){
    return;
  }

  clearReservation();

}



async function checkInReservation(reservationNo){

  if(
    !confirm(
      "来店受付を開始しますか？"
    )
  ){
    return;
  }


  try{

    const res=await fetch(

      API_URL+
      "/api/bbq/checkin",

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({
          reservationNo
        })

      }

    );


    const result=
      await res.json();


    if(result.success){

      await loadReservations();

      await searchReservation(
        reservationNo
      );

      alert("受付開始しました");

    }else{

      alert(
        result.message||
        "受付エラー"
      );

    }


  }catch(e){

    console.error(e);
    alert("通信エラー");

  }

}

async function loadBbqOptions(){

  try{

    const res=
      await fetch(
        API_URL+"/api/products"
      );

    const products=
      await res.json();


    const optionGrid=
      document.getElementById(
        "optionGrid"
      );

    const drinkGrid=
      document.getElementById(
        "drinkGrid"
      );


    if(!optionGrid||!drinkGrid)return;


    optionGrid.innerHTML="";
    drinkGrid.innerHTML="";


    products
    .sort(
      (a,b)=>
      Number(a.sort||9999)-
      Number(b.sort||9999)
    )
    .forEach(product=>{


      if(
  product.status !== "販売中" ||
  product.tablet !== "○" ||
  (
    product.type !== "bbq-option" &&
    product.type !== "drink"
  )
){
  return;
}


      const card=`

<div class="product-card">

<img 
src="${product.image || ''}"
>

<div class="product-content">

<h3>${product.name}</h3>

<p>${product.description||""}</p>

<div class="price">
¥${Number(product.price).toLocaleString()}
</div>


<div class="qty-area">

<button
class="qty-btn"
onclick="changeQty(${product.id},-1)">
－
</button>

<span
id="qty-${product.id}"
class="qty-value qty-zero">
0
</span>


<button
class="qty-btn"
onclick="changeQty(${product.id},1)">
＋
</button>

</div>


<button
class="btn btn-order"
onclick="addToCart(${product.id},'${product.name}',${product.price})">

カートへ追加

</button>

</div>
</div>`;


      if(product.type==="bbq-option"){
        optionGrid.innerHTML+=card;
      }


      if(product.type==="drink"){
        drinkGrid.innerHTML+=card;
      }


    });


  }catch(e){

    console.error(e);
    alert("商品取得エラー");

  }

}



function changeQty(id,diff){

  const target =
    document.getElementById(
      "qty-"+id
    );

  if(!target)return;


  let qty =
    Number(target.innerText)+diff;


  if(qty < 0){

    qty = 0;

  }


  target.innerText = qty;


  if(qty === 0){

    target.classList.add(
      "qty-zero"
    );

  }else{

    target.classList.remove(
      "qty-zero"
    );

  }

}


function addToCart(id,name,price){

  if(!currentReservation){

    alert("予約を選択してください");
    return;

  }


  if(currentReservation.status!=="来店済"){

    alert("受付開始後に追加注文できます");
    return;

  }


  const qty=
    Number(
      document.getElementById(
        "qty-"+id
      ).innerText
    );

if(qty <= 0){

  alert("数量を入力してください");
  return;

}  
  const item=
    bbqCart.find(
      p=>String(p.id)===String(id)
    );


  if(item){

    item.qty+=qty;

  }else{

    bbqCart.push({

      id,
      name,
      price:Number(price),
      qty

    });

  }


  saveCart();

const qtyTarget =
  document.getElementById(
    "qty-"+id
  );

if(qtyTarget){

  qtyTarget.innerText = 0;

  qtyTarget.classList.add(
    "qty-zero"
  );

}

renderCart();

}



function changeOrderQty(id,diff){

  const item=
    bbqCart.find(
      p=>String(p.id)===String(id)
    );


  if(!item)return;


  item.qty+=diff;


  if(item.qty<=0){

    bbqCart=
      bbqCart.filter(
        p=>String(p.id)!==String(id)
      );

  }


  saveCart();
  renderCart();

}



function renderCart(){

  const target=
    document.getElementById(
      "cartArea"
    );


  if(!target)return;


  target.innerHTML="";


  if(!currentReservation){

    target.innerHTML=`
<div class="product-card">
<div class="product-content">
<h3>予約を選択してください</h3>
</div>
</div>`;

    updateCartSummary();
    return;

  }


  let total=0;


  if(!bbqCart.length){

    target.innerHTML=`
<div class="product-card">
<div class="product-content">
<h3>商品がありません</h3>
</div>
</div>`;

    updateCartSummary();
    return;

  }


  bbqCart.forEach(item=>{

    const subtotal=
      item.price*item.qty;

    total+=subtotal;


    target.innerHTML+=`

<div class="product-card">

<div class="product-content">

<h3>${item.name}</h3>

<div class="qty-area">

<button
class="qty-btn"
onclick="changeOrderQty('${item.id}',-1)">
－
</button>


<span class="qty-value">
${item.qty}
</span>


<button
class="qty-btn"
onclick="changeOrderQty('${item.id}',1)">
＋
</button>

</div>


<div class="price">
¥${subtotal.toLocaleString()}
</div>

</div>

</div>`;

  });


  target.innerHTML+=`

<h2>
合計 ¥${total.toLocaleString()}
</h2>`;

  updateCartSummary();

}



function updateCartSummary(){

  const target=
    document.getElementById(
      "cartSummary"
    );


  if(!target)return;


  let qty=0;
  let total=0;


  bbqCart.forEach(item=>{

    qty+=Number(item.qty);
    total+=item.qty*item.price;

  });


  target.innerHTML=
  `カート ${qty}点 ／ ¥${total.toLocaleString()}`;

}



function clearCart(){

  if(!currentReservation)return;


  if(!confirm("カートを空にしますか？"))
  return;


  bbqCart=[];

  saveCart();
  renderCart();

}



async function sendBbqOptionOrder(){

  if(!currentReservation){

    alert("予約を選択してください");
    return;

  }


  if(currentReservation.status!=="来店済"){

    alert("受付開始後に追加注文できます");
    return;

  }


  if(!bbqCart.length){

    alert("商品を追加してください");
    return;

  }


  try{

    const res=
      await fetch(

        API_URL+
        "/api/bbq/addOrder",

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            reservationNo:
            currentReservation.reservationNo,

            useDate:
            currentReservation.useDate,

            customerName:
            currentReservation.customerName,

            customerTel:
            currentReservation.customerTel,

            memo:"",

            items:bbqCart

          })

        }

      );


    const result=
      await res.json();


    if(result.success){

      alert("追加注文を受け付けました");

      bbqCart=[];

      saveCart();
      renderCart();

      await searchReservation(
        currentReservation.reservationNo
      );

    }else{

      alert(
        result.message||
        "送信エラー"
      );

    }


  }catch(e){

    console.error(e);
    alert("通信エラー");

  }

}



async function loadOrderHistory(reservationNo){

  try{

    const res=
      await fetch(

        API_URL+
        "/api/bbq/history?reservationNo="+
        encodeURIComponent(
          reservationNo
        )

      );


    return await res.json();


  }catch(e){

    console.error(e);

    return{
      items:[],
      total:0
    };

  }

}
