// =========================
// レシピ管理
// Ver.1.0
// =========================

let products = [];

let filteredProducts = [];

let materials = [];

let filteredMaterials = [];

let recipeItems = [];

let selectedProduct = null;

// =========================
// 初期化
// =========================
window.addEventListener(

  "DOMContentLoaded",

  async ()=>{

    await loadProducts();

    await loadMaterials();

  }

);

// =========================
// 商品一覧取得
// =========================
async function loadProducts(){

  try{

    const headers = {

      Authorization:
        "Bearer " +
        localStorage.getItem(
          "adminToken"
        )

    };

    // =========================
    // 商品取得
    // =========================
    const productsRes =
      await fetch(

        API_URL +
        "/api/products",

        {
          headers
        }

      );

    if(!productsRes.ok){

      throw new Error(
        "商品取得失敗"
      );

    }

    const data =
      await productsRes.json();

    console.log(
      "レシピ管理 商品一覧:",
      data
    );

    if(!Array.isArray(data)){

      products = [];

      filteredProducts = [];

      renderProducts();

      return;

    }

    // =========================
    // レシピ情報取得
    // =========================
    const recipesRes =
      await fetch(

        API_URL +
        "/api/recipes",

        {
          headers
        }

      );

    let recipes = [];

    if(recipesRes.ok){

      recipes =
        await recipesRes.json();

      if(!Array.isArray(recipes)){

        recipes = [];

      }

    }

    console.log(
      "レシピ管理 レシピ一覧:",
      recipes
    );

    // =========================
    // 商品ID → レシピ情報
    // =========================
    const recipeMap = {};

    recipes.forEach(recipe => {

      recipeMap[
        String(
          recipe.productId
        )
      ] = {

        cost:
          Number(
            recipe.cost || 0
          ),

        costRate:
          Number(
            recipe.costRate || 0
          )

      };

    });

    // =========================
    // 商品データを
    // レシピ管理用に統一
    // =========================
    products =
      data.map(item => {

        const recipe =
          recipeMap[
            String(item.id)
          ];

        return {

          productId:
            item.id,

          productName:
            item.name,

          price:
            Number(
              item.price || 0
            ),

          // =====================
          // レシピ原価
          // =====================
          recipeCost:
            recipe
            ? recipe.cost
            : 0,

          // =====================
          // レシピ原価率
          // =====================
          recipeCostRate:
            recipe
            ? recipe.costRate
            : 0

        };

      });

    filteredProducts =
      [...products];

    renderProducts();

  }

  catch(error){

    console.error(
      "商品取得エラー:",
      error
    );

    products = [];

    filteredProducts = [];

    document.getElementById(
      "productList"
    ).innerHTML =

      `
      <div class="card">

        商品取得失敗

      </div>
      `;

  }

}

// =========================
// 商品一覧表示
// =========================
function renderProducts(){

  const list =

    document.getElementById(
      "productList"
    );

  if(
    filteredProducts.length === 0
  ){

    list.innerHTML =

    `

    <div class="card">

      商品がありません

    </div>

    `;

    return;

  }

  let html = "";

  filteredProducts.forEach(

    item=>{

      html +=

      `

      <div

      class="product-card

      ${

      selectedProduct &&

      selectedProduct.productId ===

      item.productId

      ?

      "active"

      :

      ""

      }"

      onclick="selectProduct(

      '${item.productId}'

      )"

      >

      <strong>

      ${escapeHtml(

        item.productName

      )}

      </strong>

      <br>

      販売価格：

      ${Number(

        item.price

      ).toLocaleString()}

      円

      <br>

      原価率：
      
      ${Number(
      
        item.recipeCostRate || 0
      
      ).toFixed(1)}
      
      %

      </div>

      `;

    }

  );

  list.innerHTML =

    html;

}

// =========================
// 商品検索
// =========================
function filterProducts(){

  const keyword =

    document
      .getElementById(
        "searchProduct"
      )
      .value
      .trim()
      .toLowerCase();

  if(
    keyword === ""
  ){

    filteredProducts =

      [...products];

  }

  else{

    filteredProducts =

      products.filter(

        item=>

          String(
            item.productName
          )

          .toLowerCase()

          .includes(
            keyword
          )

      );

  }

  renderProducts();

}

// =========================
// 商品選択
// =========================
async function selectProduct(

  productId

){

  selectedProduct =

    products.find(

      p=>

        String(
          p.productId
        ) ===
        String(productId)

    );

  renderProducts();

  await loadRecipe(
    productId
  );

}

// =========================
// レシピ取得
// =========================
async function loadRecipe(

  productId

){

  try{

    const res =

      await fetch(

        API_URL +

        "/api/recipe?productId=" +

        encodeURIComponent(
          productId
        ),

        {

          headers:{

            Authorization:

              "Bearer " +

              localStorage.getItem(
                "adminToken"
              )

          }

        }

      );

    if(!res.ok){

      throw new Error();

    }

    recipeItems =

      await res.json();

    if(
      !Array.isArray(
        recipeItems
      )
    ){

      recipeItems = [];

    }

    renderRecipe();

  }

  catch(error){

    console.error(error);

    recipeItems = [];

    renderRecipe();

  }

}

// =========================
// レシピ表示
// =========================
function renderRecipe(){

  document.getElementById(

    "recipeTitle"

  ).textContent =

    selectedProduct

    ?

    selectedProduct.productName

    :

    "商品を選択してください";

  document.getElementById(

    "recipePrice"

  ).textContent =

    selectedProduct

    ?

    Number(

      selectedProduct.price

    ).toLocaleString()

    + " 円"

    :

    "0 円";

  const tbody =

    document.getElementById(
      "recipeBody"
    );

  if(
    recipeItems.length === 0
  ){

    tbody.innerHTML =

    `

    <tr>

      <td colspan="6">

        材料がありません。

      </td>

    </tr>

    `;

    calculateRecipe();

    return;

  }

  let html = "";

  recipeItems.forEach(

    (

      item,

      index

    )=>{

      html +=

      `

      <tr>

        <td>

          ${escapeHtml(

            item.materialName

          )}

        </td>

        <td>

          ${item.qty}

        </td>

        <td>

          ${item.unit}

        </td>

        <td>

          ${item.lossRate}

          %

        </td>

        <td>

          ${Number(

            item.cost

          ).toFixed(3)}

          円

        </td>

        <td>

          <button

          onclick="removeRecipeMaterial(

          ${index}

          )"

          >

          削除

          </button>

        </td>

      </tr>

      `;

    }

  );

  tbody.innerHTML =

    html;

  calculateRecipe();

}

// =========================
// 商品原価計算
// =========================
function calculateRecipe(){

  let total = 0;

  recipeItems.forEach(

    item=>{

      total +=

        Number(
          item.cost || 0
        );

    }

  );

  document.getElementById(

    "recipeCost"

  ).textContent =

    total.toFixed(3)

    + " 円";

  let rate = 0;

  if(

    selectedProduct &&

    Number(
      selectedProduct.price
    ) > 0

  ){

    rate =

      total /

      Number(
        selectedProduct.price
      )

      * 100;

  }

  document.getElementById(

    "recipeCostRate"

  ).textContent =

    rate.toFixed(1)

    + " %";

}

// =========================
// 材料一覧取得
// =========================
async function loadMaterials(){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/materials",

        {

          headers:{

            Authorization:
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          }

        }

      );

    if(!res.ok){

      throw new Error();

    }

    materials =
      await res.json();

    if(
      !Array.isArray(materials)
    ){

      materials = [];

    }

    filteredMaterials =
      [...materials];

  }

  catch(error){

    console.error(error);

    materials = [];

    filteredMaterials = [];

  }

}

// =========================
// 材料追加モーダル
// =========================
function openMaterialModal(){

  if(!selectedProduct){

    alert(
      "先に商品を選択してください。"
    );

    return;

  }

  filteredMaterials =
    [...materials];

  renderMaterialList();

  document.getElementById(
    "materialSearch"
  ).value = "";

  document.getElementById(
    "selectedMaterialId"
  ).value = "";

  document.getElementById(
    "selectedMaterialName"
  ).value = "";

  document.getElementById(
    "recipeQty"
  ).value = "";

  document.getElementById(
    "recipeUnit"
  ).value = "";

  document.getElementById(
    "recipeLoss"
  ).value = 0;

  document.getElementById(
    "recipeRemarks"
  ).value = "";

  document.getElementById(
    "materialModal"
  ).style.display =
    "block";

}

// =========================
// モーダルを閉じる
// =========================
function closeMaterialModal(){

  document.getElementById(
    "materialModal"
  ).style.display =
    "none";

}

// =========================
// 材料一覧表示
// =========================
function renderMaterialList(){

  const list =
    document.getElementById(
      "modalMaterialList"
    );

  if(
    filteredMaterials.length === 0
  ){

    list.innerHTML =

    `
    <div class="material-item">

      材料がありません

    </div>
    `;

    return;

  }

  let html = "";

  filteredMaterials.forEach(

    item=>{

      html +=

      `
      <div

      class="material-item"

      onclick="selectMaterial(

      '${item.id}'

      )"

      >

      <strong>

      ${escapeHtml(
        item.name
      )}

      </strong>

      <br>

      ${escapeHtml(
        item.category
      )}

      ／

      ${Number(
        item.unitCost || 0
      ).toFixed(3)}

      円/${item.useUnit}

      </div>
      `;

    }

  );

  list.innerHTML =
    html;

}

// =========================
// 材料検索
// =========================
function filterMaterials(){

  const keyword =

    document
      .getElementById(
        "materialSearch"
      )
      .value
      .trim()
      .toLowerCase();

  if(
    keyword === ""
  ){

    filteredMaterials =
      [...materials];

  }

  else{

    filteredMaterials =

      materials.filter(

        item=>

          String(item.name)

          .toLowerCase()

          .includes(keyword)

          ||

          String(item.category)

          .toLowerCase()

          .includes(keyword)

      );

  }

  renderMaterialList();

}

// =========================
// 材料選択
// =========================
function selectMaterial(id){

  const item =

    materials.find(

      m=>

        String(m.id) ===
        String(id)

    );

  if(!item){

    return;

  }

  document.getElementById(
    "selectedMaterialId"
  ).value =
    item.id;

  document.getElementById(
    "selectedMaterialName"
  ).value =
    item.name;

  document.getElementById(
    "recipeUnit"
  ).value =
    item.useUnit;

}

// =========================
// 材料追加
// =========================
function addRecipeMaterial(){

  const materialId =
    document.getElementById(
      "selectedMaterialId"
    ).value;

  if(!materialId){

    alert("材料を選択してください。");

    return;

  }

  const material =

    materials.find(

      m=>

        String(m.id) ===
        String(materialId)

    );

  if(!material){

    return;

  }

  const qty =
    Number(
      document.getElementById(
        "recipeQty"
      ).value || 0
    );

  const lossRate =
    Number(
      document.getElementById(
        "recipeLoss"
      ).value || 0
    );

  const cost =

    qty *

    Number(material.unitCost || 0) *

    (
      1 +
      lossRate / 100
    );

  // =========================
  // 重複チェック
  // =========================
  const exists =

    recipeItems.some(

      item=>

        String(item.materialId) ===
        String(materialId)

    );

  if(exists){

    alert(

      "この材料は既に登録されています。"

    );

    return;

  }
  
  recipeItems.push({

    materialId:
      material.id,

    materialName:
      material.name,

    category:
      material.category,

    qty,

    unit:
      material.useUnit,

    unitCost:
      material.unitCost,

    lossRate,

    cost:
      Number(
        cost.toFixed(3)
      ),

    remarks:
      document.getElementById(
        "recipeRemarks"
      ).value

  });

  closeMaterialModal();

  renderRecipe();

}

// =========================
// 保存
// =========================
async function saveRecipe(){

  if(!selectedProduct){

    alert(
      "商品を選択してください。"
    );

    return;

  }

  if(
    recipeItems.length === 0
  ){

    if(
      !confirm(
        "レシピがありません。このまま保存しますか？"
      )
    ){

      return;

    }

  }

  try{

    const res =
      await fetch(

        API_URL +
        "/api/recipe/save",

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json",

            Authorization:
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )

          },

          body:JSON.stringify({

            productId:
              selectedProduct.productId,

            items:
              recipeItems

          })

        }

      );

    const result =
      await res.json();

    if(
      !res.ok ||
      !result.success
    ){

      throw new Error(
        result.message ||
        "保存失敗"
      );

    }

    alert(

      "保存しました。\n\n" +

      "商品原価：" +

      Number(
        result.totalCost || 0
      ).toFixed(3) +

      " 円"

    );

    await loadProducts();

    await loadRecipe(
      selectedProduct.productId
    );

  }

  catch(error){

    console.error(error);

    alert(
      "保存できませんでした。"
    );

  }

}

// =========================
// 材料削除
// =========================
function removeRecipeMaterial(index){

  if(

    !confirm(
      "削除しますか？"
    )

  ){

    return;

  }

  recipeItems.splice(

    index,

    1

  );

  renderRecipe();

}

// =========================
// HTMLエスケープ
// =========================
function escapeHtml(value){

  return String(value)

  .replace(
    /&/g,
    "&amp;"
  )

  .replace(
    /</g,
    "&lt;"
  )

  .replace(
    />/g,
    "&gt;"
  )

  .replace(
    /"/g,
    "&quot;"
  )

  .replace(
    /'/g,
    "&#039;"
  );

}
