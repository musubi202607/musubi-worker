// =========================
// 初期化
// =========================
window.onload = function(){

  initImageUpload();

  loadProducts();

};


// =========================
// 商品画像アップロード初期化
// =========================
function initImageUpload(){

  const fileInput =
    document.getElementById(
      "newImageFile"
    );

  const dropArea =
    document.getElementById(
      "dropArea"
    );

  if(!fileInput || !dropArea){

    return;

  }

  // -------------------------
  // ファイル選択
  // -------------------------
  fileInput.addEventListener(

    "change",

    async ()=>{

      await uploadImage({

        fileInputId:
          "newImageFile",

        previewId:
          "newPreview",

        urlInputId:
          "newImage",

        statusId:
          "uploadStatus",

        buttonId:
          "addButton"

      });

    }

  );

  // -------------------------
  // クリック
  // -------------------------
  dropArea.onclick = ()=>{

    fileInput.click();

  };

  // -------------------------
  // Drag Over
  // -------------------------
  dropArea.addEventListener(

    "dragover",

    e=>{

      e.preventDefault();

      dropArea.classList.add(
        "drag"
      );

    }

  );

  // -------------------------
  // Drag Leave
  // -------------------------
  dropArea.addEventListener(

    "dragleave",

    ()=>{

      dropArea.classList.remove(
        "drag"
      );

    }

  );

  // -------------------------
  // Drop
  // -------------------------
  dropArea.addEventListener(

    "drop",

    e=>{

      e.preventDefault();

      dropArea.classList.remove(
        "drag"
      );

      fileInput.files =
        e.dataTransfer.files;

      fileInput.dispatchEvent(

        new Event("change")

      );

    }

  );

}

// =========================
// 商品一覧取得
// =========================
async function loadProducts(){

  try{

    const headers = {
      Authorization:
        "Bearer " +
        localStorage.getItem("adminToken")
    };

    // =========================
    // 商品取得
    // =========================
    const productsRes =
      await fetch(
        API_URL + "/api/products",
        { headers }
      );

    if(!productsRes.ok){
      throw new Error(
        "商品取得失敗"
      );
    }

    const data =
      await productsRes.json();

    // =========================
    // レシピ情報取得
    // =========================
    const recipesRes =
      await fetch(
        API_URL + "/api/recipes",
        { headers }
      );

    let recipes = [];

    if(recipesRes.ok){

      recipes =
        await recipesRes.json();

      if(!Array.isArray(recipes)){
        recipes = [];
      }

    }

    // =========================
    // 商品ID → レシピ原価
    // =========================
    const recipeMap = {};

    recipes.forEach(recipe => {

      recipeMap[
        String(recipe.productId)
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
    // 商品データに原価を追加
    // =========================
    data.forEach(item => {

      const recipe =
        recipeMap[
          String(item.id)
        ];

      item.recipeCost =
        recipe
        ? recipe.cost
        : 0;

      item.recipeCostRate =
        recipe
        ? recipe.costRate
        : 0;

    });

    let html = "";

    const fromKitchen =
      new URLSearchParams(
        location.search
      ).get("from") === "kitchen";

    data
      .filter(item => item.id)
      .sort((a,b)=>{

        // キッチンカーから開いた場合だけ
        if(fromKitchen){

          const aKitchen =
            a.kitchenCar === "○"
              ? 0
              : 1;

          const bKitchen =
            b.kitchenCar === "○"
              ? 0
              : 1;

          if(
            aKitchen !==
            bKitchen
          ){

            return (
              aKitchen -
              bKitchen
            );

          }

        }

        return (
          Number(a.sort || 9999) -
          Number(b.sort || 9999)
        );

      })
      .forEach(item=>{

        html += `

        <div class="product-card">

          <strong>
            ${item.name || ""}
          </strong>

          <br>

          <b>
            ${item.price || 0}円
          </b>

          <br>

          商品原価：
          ${
            Number(
              item.recipeCost || 0
            ).toFixed(3)
          }円

          <br>

          原価率：
          ${
            Number(
              item.recipeCostRate || 0
            ).toFixed(1)
          }%

          <br>

          キッチンカー：
          ${item.kitchenPrice || "-"}円

          <br>

          状態：
          ${item.status || "停止"}

          <br>

          店舗：
          ${item.store || "×"}

          <br>

          スタッフ：
          ${item.staff || "×"}

          <br>

          タブレット：
          ${item.tablet || "×"}

          <br>

          キッチンカー：
          ${item.kitchenCar || "×"}

          <br><br>

          <button
            class="save-btn"
            onclick="openProductEdit(${item.id})"
          >
            ✏️ 編集
          </button>

          <div
            id="edit_${item.id}"
            class="product-edit-card"
            style="display:none;"
          >

            <hr>

            <div class="product-card-row">

              <label>ID</label>

              ${item.id}

            </div>

            <div class="product-card-row">

              <label>商品名</label>

              <input
                id="name_${item.id}"
                value="${item.name || ""}"
              >

            </div>

            <div class="product-card-row">

              <label>価格</label>

              <input
                type="number"
                id="price_${item.id}"
                value="${item.price || 0}"
              >

            </div>

            <div class="product-card-row">

              <label>商品原価</label>

              <span>

                ${
                  Number(
                    item.recipeCost || 0
                  ).toFixed(3)
                } 円

              </span>

            </div>

            <div class="product-card-row">

              <label>原価率</label>

              <span>

                ${
                  Number(
                    item.recipeCostRate || 0
                  ).toFixed(1)
                } %

              </span>

            </div>

            <div class="product-card-row">

              <label>
                キッチンカー価格
              </label>

              <input
                type="number"
                id="kitchenPrice_${item.id}"
                value="${item.kitchenPrice || ""}"
              >

            </div>

            <div class="product-card-row">

              <label>説明</label>

              <input
                id="desc_${item.id}"
                value="${item.description || ""}"
              >

            </div>

            <div class="product-card-row">

              <label>画像URL</label>

              <input
                id="image_${item.id}"
                value="${item.image || ""}"
                readonly
              >

              <br><br>

              <label class="image-change-btn">

                📷 画像を変更

                <input
                  type="file"
                  id="file_${item.id}"
                  accept="image/*"
                  onchange="uploadProductImage(${item.id})"
                >

              </label>

            </div>

            <div class="product-card-row">

              <label>種類</label>

              <select id="type_${item.id}">

                <option
                  value="onigiri"
                  ${item.type==="onigiri"?"selected":""}
                >
                  onigiri
                </option>

                <option
                  value="bbq"
                  ${item.type==="bbq"?"selected":""}
                >
                  bbq
                </option>

                <option
                  value="bbq-option"
                  ${item.type==="bbq-option"?"selected":""}
                >
                  bbq-option
                </option>

                <option
                  value="drink"
                  ${item.type==="drink"?"selected":""}
                >
                  drink
                </option>

              </select>

            </div>

            <div class="product-card-row">

              <label>店舗</label>

              <select id="store_${item.id}">
                <option value="○"
                  ${item.store==="○"?"selected":""}>
                  ○
                </option>
                <option value="×"
                  ${item.store==="×"?"selected":""}>
                  ×
                </option>
              </select>

            </div>

            <div class="product-card-row">

              <label>スタッフ</label>

              <select id="staff_${item.id}">
                <option value="○"
                  ${item.staff==="○"?"selected":""}>
                  ○
                </option>
                <option value="×"
                  ${item.staff==="×"?"selected":""}>
                  ×
                </option>
              </select>

            </div>

            <div class="product-card-row">

              <label>タブレット</label>

              <select id="tablet_${item.id}">
                <option value="○"
                  ${item.tablet==="○"?"selected":""}>
                  ○
                </option>
                <option value="×"
                  ${item.tablet==="×"?"selected":""}>
                  ×
                </option>
              </select>

            </div>

            <div class="product-card-row">

              <label>キッチンカー</label>

              <select id="kitchenCar_${item.id}">
                <option value="○"
                  ${item.kitchenCar==="○"?"selected":""}>
                  ○
                </option>
                <option value="×"
                  ${item.kitchenCar==="×"?"selected":""}>
                  ×
                </option>
              </select>

            </div>

            <div class="product-card-row">

              <label>販売状態</label>

              <label class="switch">

                <input
                  type="checkbox"
                  id="status_${item.id}"
                  ${item.status==="販売中" ? "checked" : ""}
                >

                <span></span>

              </label>

            </div>

            <div class="product-card-row">

              <label>表示順</label>

              <input
                type="number"
                id="sort_${item.id}"
                value="${item.sort || ""}"
              >

            </div>

            <div class="product-actions">

              <button
                class="save-btn"
                onclick="saveProduct(${item.id})"
              >
                💾 保存
              </button>

              <button
                class="delete-btn"
                onclick="deleteProduct(${item.id})"
              >
                🗑 削除
              </button>

            </div>

          </div>

        </div>

        `;

      });

    document.getElementById(
      "productList"
    ).innerHTML = html;

  }
  catch(error){

    console.error(error);

    alert(
      "商品情報の取得に失敗しました。"
    );

  }

}

// =========================
// 商品追加画面表示
// =========================
function openAddProduct(){

  const area =
    document.getElementById(
      "addProductArea"
    );

  if(
    area.style.display === "none" ||
    area.style.display === ""
  ){

    area.style.display =
      "block";


    // 新規商品 初期値
    document.getElementById(
      "newStore"
    ).value = "○";

    document.getElementById(
      "newStaff"
    ).value = "○";

    document.getElementById(
      "newTablet"
    ).value = "○";

    document.getElementById(
      "newKitchenCar"
    ).value = "○";


    window.scrollTo({

      top:
        area.offsetTop,

      behavior:
        "smooth"

    });

  }else{

    area.style.display =
      "none";

  }

}

// =========================
// 商品編集画面表示
// =========================
function openProductEdit(id){

  const box =
    document.getElementById(

      "edit_" + id

    );

  if(
    box.style.display === "none"
  ){

    box.style.display =
      "block";

  }else{

    box.style.display =
      "none";

  }

}


// =========================
// 商品画像変更
// =========================
async function uploadProductImage(id){

  try{

    await uploadImage({

      fileInputId:
        "file_" + id,

      previewId:
        "preview_" + id,

      urlInputId:
        "image_" + id

    });

  }catch(error){

    console.error(error);

    alert(
      "画像アップロード失敗"
    );

  }

}

// =========================
// 商品更新
// =========================
async function saveProduct(id){

  const body = {

    id,

    name:
      document.getElementById(
        "name_" + id
      ).value,

    price:
      document.getElementById(
        "price_" + id
      ).value,

    kitchenPrice:
      document.getElementById(
        "kitchenPrice_" + id
      ).value,
    
    description:
      document.getElementById(
        "desc_" + id
      ).value,

    image:
      document.getElementById(
        "image_" + id
      ).value,

    type:
      document.getElementById(
        "type_" + id
      ).value,

    status:

      document.getElementById(
        "status_" + id
      ).checked

      ? "販売中"

      : "停止",

    sort:
     document.getElementById(
      "sort_" + id
      ).value,

    store:
     document.getElementById(
      "store_" + id
     ).value,

    staff:
     document.getElementById(
      "staff_" + id
    ).value,

    tablet:
    document.getElementById(
      "tablet_" + id
    ).value,

    kitchenCar:
    document.getElementById(
      "kitchenCar_" + id
    ).value

  };

  try{

    const res =
  await fetch(
    API_URL + "/api/products/update",
    {
      method:"POST",

      headers:{
        "Content-Type":
          "application/json",

        Authorization:
          "Bearer " +
          localStorage.getItem("adminToken")
      },

      body:
        JSON.stringify(body)

    }
  );

    const result =
      await res.json();

    if(result.success){

      alert(
    "保存しました"
  );

  await loadProducts();

}else{

      alert(

        result.message ||

        "保存失敗"

      );

    }

  }catch(error){

    console.error(error);

    alert(
      "通信エラー"
    );

  }

}

// =========================
// 商品削除
// =========================
async function deleteProduct(id){

  if(
    !confirm(
      "削除しますか？"
    )
  ){

    return;

  }

  try{

    const res =
      await fetch(

        API_URL +
        "/api/products/delete",

        {

          method:"POST",

          headers:{

  "Content-Type":
    "application/json",

  Authorization:
    "Bearer " +
    localStorage.getItem("adminToken")

},

          body:
            JSON.stringify({

              id

            })

        }

      );

    const result =
      await res.json();

    if(result.success){

      alert(
        "削除しました"
      );

      await loadProducts();

    }else{

      alert(

        result.message ||

        "削除失敗"

      );

    }

  }catch(error){

    console.error(error);

    alert(
      "通信エラー"
    );

  }

}

// =========================
// 商品追加
// =========================
async function addProduct(){

  const body = {

  name:
    document.getElementById(
      "newName"
    ).value,

  price:
    document.getElementById(
      "newPrice"
    ).value,

  kitchenPrice:
    document.getElementById(
      "newKitchenPrice"
    ).value,
    
  description:
    document.getElementById(
      "newDescription"
    ).value,

  image:
    document.getElementById(
      "newImage"
    ).value,

  type:
    document.getElementById(
      "newType"
    ).value,

  sort:
    document.getElementById(
      "newSort"
    ).value,

  status:
    "販売中",

  store:
    document.getElementById(
      "newStore"
    ).value || "○",

  staff:
    document.getElementById(
      "newStaff"
    ).value || "○",

  tablet:
    document.getElementById(
      "newTablet"
    ).value || "○",

  kitchenCar:
    document.getElementById(
      "newKitchenCar"
    ).value || "×"

};

  try{

    const res =
      await fetch(

        API_URL +
        "/api/products",

        {

          method:"POST",

          headers:{

  "Content-Type":
    "application/json",

  Authorization:
    "Bearer " +
    localStorage.getItem("adminToken")

},

          body:
            JSON.stringify(body)

        }

      );

    const result =
      await res.json();

    if(result.success){

      alert(
        "追加しました"
      );

      // -------------------------
      // 入力欄クリア
      // -------------------------
      document.getElementById(
        "newName"
      ).value = "";

      document.getElementById(
        "newPrice"
      ).value = "";

      document.getElementById(
        "newKitchenPrice"
      ).value = "";
      
      document.getElementById(
        "newDescription"
      ).value = "";

      document.getElementById(
        "newImage"
      ).value = "";

      document.getElementById(
        "newPreview"
      ).src = "";

      document.getElementById(
        "newPreview"
      ).style.display =
        "none";

      document.getElementById(
        "newImageFile"
      ).value = "";

      document.getElementById(
        "newType"
      ).value =
        "onigiri";

      document.getElementById(
        "newSort"
      ).value = "";

      document.getElementById(
        "uploadStatus"
      ).textContent = "";

      document.getElementById(
        "addProductArea"
      ).style.display =
        "none";

      await loadProducts();

    }else{

      alert(

        result.message ||

        "追加失敗"

      );

    }

  }catch(error){

    console.error(error);

    alert(
      "通信エラー"
    );

  }

}
