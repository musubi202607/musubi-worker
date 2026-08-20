// =========================
// 共通キャッシュ
// =========================
let productCache = [];
let cartCache = [];

// =========================
// セッションID取得
// =========================
function getSessionId() {
  let id = localStorage.getItem("sessionId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("sessionId", id);
  }

  return id;
}

// =========================
// 商品取得（キャッシュ付き）
// =========================
async function loadProductsCache() {
  if (productCache.length) return productCache;

  const res = await fetch(API_URL + "/api/products");
  productCache = await res.json();

  return productCache;
}

// =========================
// カート取得（キャッシュ付き）
// =========================
async function getCart(force = false) {
  if (!force && cartCache.length) return cartCache;

  const sessionId = getSessionId();

  const res = await fetch(
    API_URL + "/api/cart?sessionId=" + sessionId
  );

  if (!res.ok) {
    cartCache = [];
    return [];
  }

  cartCache = await res.json();
  return cartCache;
}

// =========================
// カート表示
// =========================
async function displayCart() {

  const products =
    await loadProductsCache();

  const cart =
    await getCart();

  // -------------------------
  // カート件数更新
  // （index.html・cart.html共通）
  // -------------------------
  const cartCount =
    document.getElementById("cartCount");

  if (cartCount) {

    cartCount.innerText =
      cart.reduce(

        (sum, item) =>

          sum + Number(item.qty),

        0

      );

  }

  // -------------------------
  // cart.html以外はここで終了
  // -------------------------
  const cartItems =
    document.getElementById("cartItems");

  if (!cartItems) {

    return;

  }

  cartItems.innerHTML = "";

  // -------------------------
  // カートが空
  // -------------------------
  if (cart.length === 0) {

    cartItems.innerHTML = `

      <h2>

        カートは空です

      </h2>

    `;

    return;

  }

  // -------------------------
  // 商品表示
  // -------------------------
  let total = 0;

  cart.forEach(item => {

    const product =
      products.find(

        p =>

          String(p.id) ===

          String(item.id)

      );

    if (!product) {

      return;

    }

    const subtotal =

      Number(product.price) *

      Number(item.qty);

    total += subtotal;

    cartItems.innerHTML += `

<div class="product-card">

<img
src="${product.image}"
alt="${product.name}"
>

<div class="product-content">

<h3>

${product.name}

</h3>

<div class="qty-area">

<button
class="qty-btn"
onclick="changeCartQty(${product.id}, -1)"
>

－

</button>

<span
class="qty-value"
>

${item.qty}

</span>

<button
class="qty-btn"
onclick="changeCartQty(${product.id}, 1)"
>

＋

</button>

</div>

<div class="price">

¥${subtotal.toLocaleString()}

</div>

</div>

</div>

`;

  });

  cartItems.innerHTML += `

<h2
style="margin-top:20px;"
>

合計

¥${total.toLocaleString()}

</h2>

`;

}

// =========================
// カート追加
// =========================
async function addToCart(productId, qty = 1) {

  const sessionId = getSessionId();

  const res = await fetch(`${API_URL}/api/cart/add`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      sessionId,
      productId,
      qty
    })

  });

  console.log("POST status =", res.status);

  const result = await res.json();

  console.log("POST result =", result);

  cartCache = [];

  const cart = await getCart(true);

  console.log("cartCache =", cartCache);

  await displayCart();

  alert("カートへ追加しました");

}

// =========================
// 数量変更
// =========================
async function changeCartQty(productId, diff) {
  const cart = await getCart();

  const item = cart.find(
    p => Number(p.id) === Number(productId)
  );

  if (!item) return;

  let qty = Number(item.qty) + Number(diff);
  if (qty < 0) qty = 0;

  const res = await fetch(API_URL + "/api/cart/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: getSessionId(),
      productId,
      qty
    })
  });

  const result = await res.json();

  if (!result.success) {
    alert("数量変更に失敗しました");
    return;
  }

  cartCache = result.cart;
  await displayCart();
}

// =========================
// カート削除
// =========================
async function clearCart() {
  const res = await fetch(
    API_URL +
      "/api/cart/clear?sessionId=" +
      getSessionId(),
    { method: "DELETE" }
  );

  const result = await res.json();

  if (!result.success) {
    alert("削除に失敗しました");
    return;
  }

  cartCache = [];
  await displayCart();
}

// =========================
// 注文画面へ
// =========================
async function goOrder() {
  const cart = await getCart();

  if (cart.length === 0) {
    alert("カートが空です");
    return;
  }

  location.href = "order.html";
}