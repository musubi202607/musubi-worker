// =====================================================
// bbq-tablet.js（Worker API + GAS正データ版）
// =====================================================

// =========================
// 状態管理
// =========================

// 現在選択中予約（メイン状態）
let currentReservation = null;

// 本日の予約キャッシュ
let reservationCache = [];

// =========================
// LocalStorageキー設計
// =========================
const STORAGE_KEYS = {
  CURRENT_RESERVATION: "bbq_current_reservation",
  CART_PREFIX: "bbq_cart_"
};

// =====================================================
// 永続化：予約
// =====================================================

// 現在予約保存
function saveCurrentReservation(reservation) {
  currentReservation = reservation;

  localStorage.setItem(
    STORAGE_KEYS.CURRENT_RESERVATION,
    JSON.stringify(reservation)
  );
}

// 現在予約復元
function restoreCurrentReservation() {
  const json = localStorage.getItem(STORAGE_KEYS.CURRENT_RESERVATION);

  if (!json) {
    currentReservation = null;
    return false;
  }

  try {
    currentReservation = JSON.parse(json);
    return true;
  } catch (e) {
    console.error(e);
    currentReservation = null;
    return false;
  }
}

// 現在予約クリア
function clearCurrentReservation() {
  currentReservation = null;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_RESERVATION);
}

// =====================================================
// カート管理（予約単位）
// =====================================================

// カートキー生成（予約単位固定）
function getCartKey() {
  if (!currentReservation) return null;
  return STORAGE_KEYS.CART_PREFIX + currentReservation.reservationNo;
}

// カート取得
function getCart() {
  const key = getCartKey();
  if (!key) return [];

  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// カート保存
function saveCart(cart) {
  const key = getCartKey();
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(cart));
}

// =====================================================
// 起動処理
// =====================================================
window.onload = async function () {
  const productArea = document.getElementById("productArea");
  if (productArea) productArea.style.display = "none";

  //await loadBbqOption();
  await loadReservations();

  if (restoreCurrentReservation()) {
    await searchReservationByNo(currentReservation.reservationNo);
  } else {
    renderCart();
  }
};

// =====================================================
// 予約一覧取得（GAS正データ）
// =====================================================
async function loadReservations() {
  try {
    const res = await fetch(API_URL + "?mode=reservations");
    const data = await res.json();

    reservationCache = data || [];
    renderReservationList(reservationCache);

  } catch (e) {
    console.error(e);
    alert("予約取得エラー");
  }
}

// =====================================================
// 予約一覧描画（未会計のみ）
// =====================================================
function renderReservationList(data) {
  const target = document.getElementById("reservationList");
  if (!target) return;

  target.innerHTML = "";

  const list = data.filter(v => v.paid !== "済");

  if (list.length === 0) {
    target.innerHTML = `
      <div class="product-card">
        <div class="product-content">
          <h3>未会計予約なし</h3>
        </div>
      </div>`;
    return;
  }

  list.forEach(item => {
    const selected =
      currentReservation &&
      currentReservation.reservationNo === item.reservationNo;

    const checked = item.status === "来店済";

    target.innerHTML += `
      <div class="reservation-card ${selected ? "selected" : ""}">
        <h3>${item.customerName}</h3>
        <p>${item.people}名 / ${item.plan}</p>
        <p>${checked ? "🟢受付中" : "⚪受付前"}</p>

        <button onclick="selectReservation('${item.reservationNo}')">
          ${selected ? "選択中" : "選択"}
        </button>

        ${
          checked
            ? ""
            : `<button onclick="checkInReservation('${item.reservationNo}')">
                受付開始
              </button>`
        }
      </div>
    `;
  });
}

// =====================================================
// 予約選択
// =====================================================
async function selectReservation(no) {
  await searchReservationByNo(no);
}

// =====================================================
// 予約変更（リセット）
// =====================================================
function changeReservation() {
  if (!confirm("予約を解除しますか？")) return;

  clearCurrentReservation();

  const productArea = document.getElementById("productArea");
  if (productArea) productArea.style.display = "none";

  document.getElementById("currentReservation").innerHTML =
    "予約を選択してください";

  renderReservationList(reservationCache);
  renderCart();
}

// =====================================================
// 予約詳細取得（GAS）
// =====================================================
async function searchReservationByNo(no) {
  try {
    const res = await fetch(
      API_URL + "?mode=reservation&no=" + encodeURIComponent(no)
    );

    const data = await res.json();

    if (!data) {
      alert("予約なし");
      return;
    }

    saveCurrentReservation(data);
    await displayReservation(data);

  } catch (e) {
    console.error(e);
    alert("予約取得エラー");
  }
}

// =====================================================
// 来店受付（チェックイン）
// =====================================================
async function checkInReservation(no) {
  if (!confirm("受付開始しますか？")) return;

  try {
    const res = await fetch(
      API_URL + "?mode=checkin&no=" + encodeURIComponent(no)
    );

    const result = await res.json();

    if (!result.success) {
      alert(result.message || "失敗");
      return;
    }

    await loadReservations();
    await searchReservationByNo(no);

    alert("受付完了");

  } catch (e) {
    console.error(e);
    alert("通信エラー");
  }
}

// =====================================================
// 予約表示（コアUI）
// =====================================================
async function displayReservation(data) {
  saveCurrentReservation(data);

  const history = await loadOrderHistory(data.reservationNo);

  const bbqPrice = Number(data.price || 0);
  const optionTotal = Number(history.total || 0);
  const grandTotal = bbqPrice + optionTotal;

  let historyHtml = "";

  if (history.items?.length) {
    history.items.forEach(item => {
      historyHtml += `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.qty}</td>
          <td>¥${Number(item.amount).toLocaleString()}</td>
        </tr>`;
    });
  } else {
    historyHtml = `<tr><td colspan="3">追加なし</td></tr>`;
  }

  const target = document.getElementById("currentReservation");
  if (!target) return;

  const checkedIn = data.status === "来店済";

  target.innerHTML = `
    <div>
      <button onclick="changeReservation()">予約変更</button>
    </div>

    <h3>${data.customerName} 様</h3>
    <p>${data.reservationNo}</p>
    <p>${data.people}名 / ${data.plan}</p>
    <p>${data.status}</p>

    ${
      checkedIn
        ? ""
        : `<button onclick="checkInReservation('${data.reservationNo}')">
            受付開始
          </button>`
    }

    <hr>

    <h3>追加注文履歴</h3>

    <table>
      <tr><th>商品</th><th>数</th><th>金額</th></tr>
      ${historyHtml}
    </table>

    <div>
      <p>BBQ ¥${bbqPrice.toLocaleString()}</p>
      <p>追加 ¥${optionTotal.toLocaleString()}</p>
      <h2>合計 ¥${grandTotal.toLocaleString()}</h2>
    </div>
  `;

  const productArea = document.getElementById("productArea");
  if (productArea) {
    productArea.style.display = checkedIn ? "block" : "none";
  }

  renderReservationList(reservationCache);
  renderCart();
}

// =====================================================
// カート追加（予約固定）
// =====================================================
function addBbqOption(id, name, price) {
  if (!currentReservation) return alert("予約未選択");
  if (currentReservation.status !== "来店済")
    return alert("受付後のみ追加可能");

  const cart = getCart();

  const item = cart.find(v => String(v.id) === String(id));

  if (item) item.qty++;
  else cart.push({ id, name, price: Number(price), qty: 1 });

  saveCart(cart);
  renderCart();
}

// =====================================================
// カート表示
// =====================================================
function renderCart() {
  const target = document.getElementById("cartArea");
  if (!target) return;

  if (!currentReservation) {
    target.innerHTML = "<h3>予約を選択してください</h3>";
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    target.innerHTML = "<h3>カート空</h3>";
    return;
  }

  let total = 0;
  target.innerHTML = "";

  cart.forEach(item => {
    const sub = item.price * item.qty;
    total += sub;

    target.innerHTML += `
      <div>
        <h4>${item.name}</h4>
        <button onclick="changeCartQty('${item.id}',-1)">-</button>
        ${item.qty}
        <button onclick="changeCartQty('${item.id}',1)">+</button>
        <span>¥${sub.toLocaleString()}</span>
      </div>`;
  });

  target.innerHTML += `<h3>合計 ¥${total.toLocaleString()}</h3>`;
}

// =====================================================
// 数量変更
// =====================================================
function changeCartQty(id, diff) {
  let cart = getCart();

  const item = cart.find(v => String(v.id) === String(id));
  if (!item) return;

  item.qty += diff;

  if (item.qty <= 0) {
    cart = cart.filter(v => String(v.id) !== String(id));
  }

  saveCart(cart);
  renderCart();
}

// =====================================================
// カートクリア
// =====================================================
function clearCart() {
  if (!currentReservation) return;
  if (!confirm("カート削除？")) return;

  localStorage.removeItem(getCartKey());
  renderCart();
}

// =====================================================
// 追加注文送信（GAS）
// =====================================================
async function sendTabletOrder() {
  if (!currentReservation) return alert("予約なし");
  if (currentReservation.status !== "来店済")
    return alert("受付後のみ");

  const cart = getCart();
  if (!cart.length) return alert("空です");

  try {
    const params = new URLSearchParams({
      mode: "saveBbqOption",
      reservationNo: currentReservation.reservationNo,
      orderDate: currentReservation.useDate,
      customerName: currentReservation.customerName,
      items: JSON.stringify(cart)
    });

    const res = await fetch(API_URL + "?" + params);
    const result = await res.json();

    if (!result.success) return alert("失敗");

    alert("送信完了");

    clearCart();

    await searchReservationByNo(currentReservation.reservationNo);

  } catch (e) {
    console.error(e);
    alert("通信エラー");
  }
}

// =====================================================
// 注文履歴
// =====================================================
async function loadOrderHistory(no) {
  try {
    const res = await fetch(
      API_URL + "?mode=orderhistory&no=" + encodeURIComponent(no)
    );

    return await res.json();

  } catch (e) {
    return { total: 0, items: [] };
  }
}