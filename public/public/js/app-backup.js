async function loadProducts() {

  const response =
    await fetch(
      API_URL + '/api/products'
    );

  const products =
    await response.json();

  const onigiri =
    products.filter(
      p => p.type === 'onigiri'
    );

  const grid =
    document.getElementById('productGrid');

  grid.innerHTML = '';

  onigiri.forEach(product => {

    grid.innerHTML += `
      <div class="product-card">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div class="product-content">

          <h3>${product.name}</h3>

          <p>${product.description}</p>

          <div class="price">
            ¥${Number(product.price).toLocaleString()}
          </div>

          <div class="qty-area">

            <button
              class="qty-btn"
              onclick="changeQty(${product.id}, -1)"
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
              onclick="changeQty(${product.id}, 1)"
            >
              ＋
            </button>

          </div>

          <button
            onclick="addToCartQty(${product.id})"
          >
            カートに追加
          </button>

        </div>

      </div>
    `;

  });

}

function changeQty(productId, diff) {

  const target =
    document.getElementById(`qty-${productId}`);

  let qty =
    Number(target.innerText);

  qty += diff;

  if (qty < 1) qty = 1;

  target.innerText = qty;
}

function addToCartQty(productId) {

  const qty =
    Number(
      document.getElementById(`qty-${productId}`).innerText
    );

  addToCart(productId, qty);
}

loadProducts();

window.addEventListener('pageshow', () => {
  updateCartCount();
});