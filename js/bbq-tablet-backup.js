let currentReservation = null;

// =========================
// 本日の予約一覧（2件想定・選択式）
// =========================
async function loadReservations(){

  try{

    const response =
      await fetch(
        API_URL + '?mode=reservations'
      );

    const data =
      await response.json();

    const target =
      document.getElementById('reservationList');

    if(!target) return;

    target.innerHTML = '';

    if(data.length === 0){

      target.innerHTML = `
        <div class="product-card">
          <div class="product-content">
            <h3>本日の予約はありません</h3>
          </div>
        </div>
      `;
      return;
    }

    // ★最大2件表示
    data.slice(0,2).forEach(item => {

      const isSelected =
        currentReservation &&
        currentReservation.reservationNo === item.reservationNo;

      target.innerHTML += `

        <div class="reservation-card"
          style="border: ${isSelected ? '2px solid #28a745' : '1px solid #ddd'}"
        >

          <div class="product-content">

            <h3>${item.customerName}</h3>

            <p>予約番号：${item.reservationNo}</p>
            <p>電話：${item.customerTel || '-'}</p>
            <p>${item.people}名 / ${item.plan}</p>

            <button
              class="btn btn-checkin"
              onclick="selectReservation('${item.reservationNo}')"
            >
              この予約を選択
            </button>

            <button
              class="btn btn-order"
              onclick="checkInReservation('${item.reservationNo}')"
            >
              受付
            </button>

          </div>

        </div>

      `;
    });

  }catch(error){

    console.error(error);
    alert('予約一覧取得エラー');

  }

}

// =========================
// 予約選択（検索廃止の代替）
// =========================
async function selectReservation(no){

  await searchReservationByNo(no);

}


// =========================
// 来店受付
// =========================
async function checkInReservation(reservationNo){

  if(!confirm('来店受付しますか？')) return;

  try{

    const response =
      await fetch(
        API_URL +
        '?mode=checkin&no=' +
        encodeURIComponent(reservationNo)
      );

    const result =
      await response.json();

    if(result.success){

      alert('受付完了');

      loadReservations();

    }else{

      alert(result.message || '受付エラー');

    }

  }catch(error){

    console.error(error);
    alert('通信エラー');

  }

}

// =========================
// 予約取得共通
// =========================
async function searchReservationByNo(no){

  try{

    const response =
      await fetch(
        API_URL +
        '?mode=reservation&no=' +
        encodeURIComponent(no)
      );

    const data =
      await response.json();

    if(!data){
      alert('予約が見つかりません');
      return;
    }

    displayReservation(data);

  }catch(error){

    console.error(error);
    alert('検索エラー');

  }

}

// =========================
// 予約表示
// =========================
function displayReservation(data){

  currentReservation = data;

  localStorage.setItem('reservationNo', data.reservationNo);
  localStorage.setItem('customerName', data.customerName);
  localStorage.setItem('customerTel', data.customerTel);
  localStorage.setItem('bbqDate', data.useDate);

  const current =
    document.getElementById('currentReservation');

  if(current){

    current.innerHTML = `
      <div class="reservation-card">

        <b>選択中</b><br><br>

        <b>予約番号：</b>${data.reservationNo}<br>
        <b>氏名：</b>${data.customerName}<br>
        <b>人数：</b>${data.people}名<br>
        <b>プラン：</b>${data.plan}

      </div>
    `;

  }

  const target =
    document.getElementById('reservationDetail');

  if(target){

    target.innerHTML = `
      <div class="product-card">
        <div class="product-content">

          <h2>${data.customerName}</h2>

          <p>電話：${data.customerTel}</p>
          <p>利用日：${data.useDate}</p>
          <p>状態：${data.status}</p>
          <p>会計：${data.paid}</p>

        </div>
      </div>
    `;

  }

}


// =========================
// BBQ追加商品読込
// =========================
async function loadBbqOptions(){

  const response =
    await fetch(API_URL + '?mode=products');

  const products =
    await response.json();

  const bbqOptions =
    products.filter(p => p.type === 'bbq-option');

  const grid =
    document.getElementById('productGrid');

  if(!grid) return;

  grid.innerHTML = '';

  bbqOptions.forEach(product => {

    grid.innerHTML += `
      <div class="product-card">

        <img src="${product.image}" alt="${product.name}">

        <div class="product-content">

          <h3>${product.name}</h3>

          <p>${product.description}</p>

          <div class="price">
            ¥${Number(product.price).toLocaleString()}
          </div>

          <button
            onclick="addBbqOption(${product.id}, '${product.name}', ${product.price})"
          >
            追加
          </button>

        </div>

      </div>
    `;

  });

}

// =========================
// カート処理（以下そのまま）
// =========================
function addBbqOption(id, name, price){

  let cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const existing =
    cart.find(item => item.id == id);

  if(existing){
    existing.qty++;
  }else{
    cart.push({id, name, price, qty:1});
  }

  localStorage.setItem('bbqOptionCart', JSON.stringify(cart));

  renderCart();

}

function changeCartQty(id, diff){

  let cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const item =
    cart.find(p => String(p.id) === String(id));

  if(!item) return;

  item.qty += diff;

  if(item.qty <= 0){
    cart = cart.filter(p => String(p.id) !== String(id));
  }

  localStorage.setItem('bbqOptionCart', JSON.stringify(cart));

  renderCart();

}

function renderCart(){

  const cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  const target =
    document.getElementById('cartArea');

  if(!target) return;

  let total = 0;

  target.innerHTML = '';

  cart.forEach(item => {

    const subtotal =
      Number(item.price) * Number(item.qty);

    total += subtotal;

    target.innerHTML += `
      <div class="product-card">

        <div class="product-content">

          <h3>${item.name}</h3>

          <div>
            <button onclick="changeCartQty('${item.id}',-1)">－</button>
            ${item.qty}
            <button onclick="changeCartQty('${item.id}',1)">＋</button>
          </div>

          <div class="price">
            ¥${subtotal.toLocaleString()}
          </div>

        </div>

      </div>
    `;

  });

  target.innerHTML += `
    <h2>合計 ¥${total.toLocaleString()}</h2>
  `;

}

function clearCart(){

  localStorage.removeItem('bbqOptionCart');

  renderCart();

}

// =========================
// 送信
// =========================
async function sendTabletOrder(){

  if(!currentReservation){
    alert('予約を選択してください');
    return;
  }

  const cart =
    JSON.parse(localStorage.getItem('bbqOptionCart')) || [];

  if(cart.length === 0){
    alert('商品がありません');
    return;
  }

  const orderData = {

    orderType:'BBQ_OPTION',

    reservationNo: currentReservation.reservationNo,
    orderDate: currentReservation.useDate,
    customerName: currentReservation.customerName,
    customerTel: currentReservation.customerTel,

    items: cart,
    memo:''
  };

  const response =
    await fetch(API_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(orderData)
    });

  const result =
    await response.json();

  if(result.success){

    alert('追加注文完了');
    clearCart();

  }else{

    alert('送信エラー');

  }

}

// =========================
// 起動
// =========================
window.onload = function(){

  loadReservations();
  loadBbqOptions();
  renderCart();

};