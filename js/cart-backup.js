// =========================
// セッション管理
// =========================
function getSessionId() {

  let id = localStorage.getItem('sessionId');

  if (!id) {

    id = crypto.randomUUID();

    localStorage.setItem('sessionId', id);

  }

  return id;

}


// =========================
// カート取得
// =========================
async function getCart() {

  const sessionId = getSessionId();

  const res = await fetch(
    `${API_URL}/api/cart?sessionId=${sessionId}`
  );

  if (!res.ok) return [];

  return await res.json();

}


// =========================
// カート追加
// =========================
async function addToCart(productId, qty = 1) {

  const sessionId = getSessionId();

  const res = await fetch(`${API_URL}/api/cart/add`, {

    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      sessionId,
      productId,
      qty
    })

  });

  if (!res.ok) {
    alert('追加に失敗しました');
    return;
  }

  alert('カートへ追加しました');

  updateCartCount();

}


// =========================
// カート件数
// =========================
async function updateCartCount() {

  const cart = await getCart();

  const count = cart.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  );

  const target = document.getElementById('cartCount');

  if (target) {
    target.innerText = count;
  }

}


// =========================
// カート表示
// =========================
async function displayCart() {

  const [productsRes, cart] = await Promise.all([

    fetch(
      `${API_URL}/api/products`
    ),

    getCart()

  ]);

  const products =
    await productsRes.json();

  const cartItems =
    document.getElementById(
      "cartItems"
    );

  if(!cartItems){
    return;
  }

  cartItems.innerHTML = "";

  if(cart.length === 0){

    cartItems.innerHTML = `

      <h2>

        カートは空です

      </h2>

    `;

    return;

  }

  let total = 0;

  cart.forEach(item=>{

    const product =
      products.find(
        p =>
          String(p.id) ===
          String(item.id)
      );

    if(!product){
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

              onclick="
                changeCartQty(
                  ${product.id},
                  -1
                )
              "

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

              onclick="
                changeCartQty(
                  ${product.id},
                  1
                )
              "

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
// カートクリア
// =========================
async function clearCart() {

  const sessionId = getSessionId();

  const res = await fetch(
  `${API_URL}/api/cart/clear?sessionId=${sessionId}`,
  {
    method: "DELETE"
  }
);

if (!res.ok) {
  alert("カート削除に失敗しました");
  return;
}

await updateCartCount();

location.reload();

}
// =========================
// 注文画面へ
// =========================
async function goOrder() {

  const cart = await getCart();

  if (!cart.length) {
    alert('カートが空です');
    return;
  }

  location.href = 'order.html';

}


// =========================
// 初期表示
// =========================
displayCart();
updateCartCount();


// =========================
// 注文確定
// =========================
async function placeOrder() {

  const sessionId = getSessionId();

  const customerName =
    document.getElementById("customerName")?.value || "";

  const customerTel =
    document.getElementById("customerTel")?.value || "";

  const memo =
    document.getElementById("memo")?.value || "";

  const res = await fetch(
    `${API_URL}/api/order`,
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        sessionId,
        customerName,
        customerTel,
        memo
      })
    }
  );

  const data =
    await res.json();

  if(!data.success){

    alert("注文失敗");

    return;

  }

  alert("注文完了");

  location.href =
    "complete.html";

}

// =========================
// カート数量変更
// =========================
async function changeCartQty(

  productId,
  diff

){

  const cart =
    await getCart();

  const item =
    cart.find(
      p =>
        Number(p.id) ===
        Number(productId)
    );

  if(!item){
    return;
  }

  let qty =
    Number(item.qty) +
    Number(diff);

  if(qty < 0){
    qty = 0;
  }

  const res =
    await fetch(

      `${API_URL}/api/cart/update`,

      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          sessionId:
            getSessionId(),

          productId,

          qty

        })

      }

    );

  const result =
    await res.json();

  if(!result.success){

    alert("数量変更に失敗しました");

    return;

  }

  await displayCart();

  await updateCartCount();

}