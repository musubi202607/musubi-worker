// =========================
// 商品表示順管理
// 店舗 ＋ キッチンカー
// =========================

let products = [];

let storeProducts = [];

let kitchenProducts = [];


// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  async function(){

    // 戻り先設定
    const from =
      new URLSearchParams(
        location.search
      ).get("from");

    const backLink =
      document.getElementById(
        "backLink"
      );

    if(backLink){

      if(from === "kitchen"){

        backLink.href =
          "kitchen-index.html";

        backLink.innerText =
          "← キッチンカーへ戻る";

      }else{

        backLink.href =
          "admin.html";

        backLink.innerText =
          "← 管理画面へ戻る";

      }

    }

    await loadProducts();

  }
);


// =========================
// タブ切替
// =========================

function switchTab(type){

  const storeTab =
    document.getElementById(
      "storeTab"
    );

  const kitchenTab =
    document.getElementById(
      "kitchenTab"
    );

  const storeSection =
    document.getElementById(
      "storeSection"
    );

  const kitchenSection =
    document.getElementById(
      "kitchenSection"
    );


  if(type === "store"){

    storeTab.classList.add(
      "active"
    );

    kitchenTab.classList.remove(
      "active"
    );

    storeSection.classList.add(
      "active"
    );

    kitchenSection.classList.remove(
      "active"
    );

  }else{

    storeTab.classList.remove(
      "active"
    );

    kitchenTab.classList.add(
      "active"
    );

    storeSection.classList.remove(
      "active"
    );

    kitchenSection.classList.add(
      "active"
    );

  }

}


// =========================
// 商品取得
// =========================

async function loadProducts(){

  try{

    const res =
      await fetch(

        API_URL +
        "/api/products",

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

      throw new Error(
        "商品取得失敗"
      );

    }


    const data =
      await res.json();


    if(!Array.isArray(data)){

      throw new Error(
        "商品データが不正です"
      );

    }


    products =
      data.filter(
        item => item.id
      );


    // =========================
    // 店舗商品
    // 店舗○のみ
    // G列「表示順」昇順
    // 未設定はID順
    // =========================

    storeProducts =
      products
      .filter(
        item =>
          item.store === "○"
      )
      .sort(
        compareStoreProducts
      );


    // =========================
    // キッチンカー商品
    // カー○のみ
    // N列「カー表示順」昇順
    // 未設定はID順
    // =========================

    kitchenProducts =
      products
      .filter(
        item =>
          item.kitchenCar === "○"
      )
      .sort(
        compareKitchenProducts
      );


    renderStoreProducts();

    renderKitchenProducts();


  }catch(error){

    console.error(error);


    const storeList =
      document.getElementById(
        "storeSortList"
      );

    const kitchenList =
      document.getElementById(
        "kitchenSortList"
      );


    if(storeList){

      storeList.innerHTML = `

        <div class="sort-message">

          商品一覧の取得に失敗しました。

        </div>

      `;

    }


    if(kitchenList){

      kitchenList.innerHTML = `

        <div class="sort-message">

          商品一覧の取得に失敗しました。

        </div>

      `;

    }

  }

}


// =========================
// 店舗商品の比較
// =========================

function compareStoreProducts(a,b){

  const aSort =
    Number(a.sort);

  const bSort =
    Number(b.sort);


  const aHasSort =
    a.sort !== "" &&
    a.sort !== null &&
    a.sort !== undefined &&
    !isNaN(aSort) &&
    aSort > 0;


  const bHasSort =
    b.sort !== "" &&
    b.sort !== null &&
    b.sort !== undefined &&
    !isNaN(bSort) &&
    bSort > 0;


  if(aHasSort && bHasSort){

    if(aSort !== bSort){

      return aSort - bSort;

    }

  }


  if(aHasSort && !bHasSort){

    return -1;

  }


  if(!aHasSort && bHasSort){

    return 1;

  }


  return Number(a.id) -
    Number(b.id);

}


// =========================
// キッチンカー商品の比較
// =========================

function compareKitchenProducts(a,b){

  const aSort =
    Number(a.kitchenSort);

  const bSort =
    Number(b.kitchenSort);


  const aHasSort =
    a.kitchenSort !== "" &&
    a.kitchenSort !== null &&
    a.kitchenSort !== undefined &&
    !isNaN(aSort) &&
    aSort > 0;


  const bHasSort =
    b.kitchenSort !== "" &&
    b.kitchenSort !== null &&
    b.kitchenSort !== undefined &&
    !isNaN(bSort) &&
    bSort > 0;


  if(aHasSort && bHasSort){

    if(aSort !== bSort){

      return aSort - bSort;

    }

  }


  if(aHasSort && !bHasSort){

    return -1;

  }


  if(!aHasSort && bHasSort){

    return 1;

  }


  return Number(a.id) -
    Number(b.id);

}


// =========================
// 店舗表示
// =========================

function renderStoreProducts(){

  const list =
    document.getElementById(
      "storeSortList"
    );


  if(!list){

    return;

  }


  let html = "";


  storeProducts.forEach(
    (item,index)=>{

      html += `

        <div class="sort-item">

          <div class="sort-number">

            ${index + 1}

          </div>

          <div class="sort-info">

            <div class="sort-product">

              <span class="sort-id">

                ID:${escapeHtml(
                  item.id
                )}

              </span>

              <span class="sort-name">

                ${escapeHtml(
                  item.name || ""
                )}

              </span>

            </div>

          </div>

          <div class="sort-buttons">

            <button
              onclick="moveStoreProduct(
                ${index},
                -1
              )"
              ${index === 0 ? "disabled" : ""}
              aria-label="上へ"
            >
              ▲
            </button>

            <button
              onclick="moveStoreProduct(
                ${index},
                1
              )"
              ${index === storeProducts.length - 1 ? "disabled" : ""}
              aria-label="下へ"
            >
              ▼
            </button>

          </div>

        </div>

      `;

    }
  );


  if(!html){

    html = `

      <div class="sort-message">

        店舗表示対象の商品がありません。

      </div>

    `;

  }


  list.innerHTML =
    html;

}


// =========================
// キッチンカー表示
// =========================

function renderKitchenProducts(){

  const list =
    document.getElementById(
      "kitchenSortList"
    );


  if(!list){

    return;

  }


  let html = "";


  kitchenProducts.forEach(
    (item,index)=>{

      html += `

        <div class="sort-item">

          <div class="sort-number">

            ${index + 1}

          </div>

          <div class="sort-info">

            <div class="sort-product">

              <span class="sort-id">

                ID:${escapeHtml(
                  item.id
                )}

              </span>

              <span class="sort-name">

                ${escapeHtml(
                  item.name || ""
                )}

              </span>

            </div>

          </div>

          <div class="sort-buttons">

            <button
              onclick="moveKitchenProduct(
                ${index},
                -1
              )"
              ${index === 0 ? "disabled" : ""}
              aria-label="上へ"
            >
              ▲
            </button>

            <button
              onclick="moveKitchenProduct(
                ${index},
                1
              )"
              ${index === kitchenProducts.length - 1 ? "disabled" : ""}
              aria-label="下へ"
            >
              ▼
            </button>

          </div>

        </div>

      `;

    }
  );


  if(!html){

    html = `

      <div class="sort-message">

        キッチンカー表示対象の商品がありません。

      </div>

    `;

  }


  list.innerHTML =
    html;

}


// =========================
// 店舗並び替え
// =========================

function moveStoreProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= storeProducts.length
  ){

    return;

  }


  const temp =
    storeProducts[index];


  storeProducts[index] =
    storeProducts[newIndex];


  storeProducts[newIndex] =
    temp;


  renderStoreProducts();

}


// =========================
// キッチンカー並び替え
// =========================

function moveKitchenProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= kitchenProducts.length
  ){

    return;

  }


  const temp =
    kitchenProducts[index];


  kitchenProducts[index] =
    kitchenProducts[newIndex];


  kitchenProducts[newIndex] =
    temp;


  renderKitchenProducts();

}


// =========================
// 店舗表示順保存
// =========================

async function saveStoreSortOrder(){

  if(!storeProducts.length){

    return;

  }


  if(
    !confirm(
      "店舗表示順を保存しますか？"
    )
  ){

    return;

  }


  const button =
    document.getElementById(
      "saveStoreSortButton"
    );


  if(button){

    button.disabled =
      true;

    button.textContent =
      "保存中...";

  }


  try{

    // =========================
    // 一括保存用データ作成
    // =========================

    const items =
      storeProducts.map(
        (item,index)=>({

          id:
            item.id,

          sort:
            index + 1

        })
      );


    // =========================
    // Workerへ1回だけ送信
    // =========================

    const res =
      await fetch(

        API_URL +
        "/api/products/sort",

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

          body:
            JSON.stringify({

              type:
                "store",

              items:
                items

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


    // =========================
    // ローカルデータ更新
    // =========================

    storeProducts.forEach(
      (item,index)=>{

        item.sort =
          index + 1;

      }
    );


    alert(
      "店舗表示順を保存しました"
    );


  }catch(error){

    console.error(error);


    alert(
      "店舗表示順の保存に失敗しました"
    );


  }finally{

    if(button){

      button.disabled =
        false;

      button.textContent =
        "店舗表示順を保存";

    }

  }

}


// =========================
// キッチンカー表示順保存
// =========================

async function saveKitchenSortOrder(){

  if(!kitchenProducts.length){

    return;

  }


  if(
    !confirm(
      "キッチンカー表示順を保存しますか？"
    )
  ){

    return;

  }


  const button =
    document.getElementById(
      "saveKitchenSortButton"
    );


  if(button){

    button.disabled =
      true;

    button.textContent =
      "保存中...";

  }


  try{

    // =========================
    // 一括保存用データ作成
    // =========================

    const items =
      kitchenProducts.map(
        (item,index)=>({

          id:
            item.id,

          kitchenSort:
            index + 1

        })
      );


    // =========================
    // Workerへ1回だけ送信
    // =========================

    const res =
      await fetch(

        API_URL +
        "/api/products/sort",

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

          body:
            JSON.stringify({

              type:
                "kitchen",

              items:
                items

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


    // =========================
    // ローカルデータ更新
    // =========================

    kitchenProducts.forEach(
      (item,index)=>{

        item.kitchenSort =
          index + 1;

      }
    );


    alert(
      "キッチンカー表示順を保存しました"
    );


  }catch(error){

    console.error(error);


    alert(
      "キッチンカー表示順の保存に失敗しました"
    );


  }finally{

    if(button){

      button.disabled =
        false;

      button.textContent =
        "キッチンカー表示順を保存";

    }

  }

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
