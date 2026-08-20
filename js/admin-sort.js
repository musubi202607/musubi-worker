// =========================
// 表示順管理
// =========================

let products = [];


// =========================
// モード判定
// =========================

const params =
  new URLSearchParams(
    location.search
  );

const fromKitchen =
  params.get("from") === "kitchen";


// =========================
// 初期化
// =========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    setupPage();

    loadProducts();

  }
);


// =========================
// 画面設定
// =========================

function setupPage(){

  const title =
    document.getElementById(
      "sortTitle"
    );

  const modeText =
    document.getElementById(
      "modeText"
    );

  const sortMode =
    document.getElementById(
      "sortMode"
    );

  const backLink =
    document.getElementById(
      "backLink"
    );


  if(fromKitchen){

    title.textContent =
      "キッチンカー表示順";

    modeText.textContent =
      "キッチンカーの商品表示順を変更します";

    sortMode.textContent =
      "カー表示順で管理";

    backLink.href =
      "kitchen-index.html";

    backLink.textContent =
      "← キッチンカー管理へ戻る";

  }else{

    title.textContent =
      "店舗表示順";

    modeText.textContent =
      "店舗の商品表示順を変更します";

    sortMode.textContent =
      "表示順で管理";

    backLink.href =
      "admin.html";

    backLink.textContent =
      "← 管理画面へ戻る";

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
    // キッチンカー
    // =========================

    if(fromKitchen){

      products =
        products.filter(
          item =>
            item.kitchenCar === "○"
        );


      products.sort(
        compareKitchenSort
      );

    }

    // =========================
    // 店舗
    // =========================

    else{

      products.sort(
        compareStoreSort
      );

    }


    renderProducts();


  }catch(error){

    console.error(error);

    document.getElementById(
      "sortList"
    ).innerHTML = `

      <div class="loading">

        商品を取得できませんでした

      </div>

    `;

  }

}


// =========================
// 店舗並び順
// =========================

function compareStoreSort(a,b){

  const aSort =
    Number(a.sort);

  const bSort =
    Number(b.sort);


  const aHas =
    Number.isFinite(aSort);

  const bHas =
    Number.isFinite(bSort);


  // 表示順がある商品を先に
  if(aHas && bHas){

    if(aSort !== bSort){

      return aSort - bSort;

    }

  }

  if(aHas !== bHas){

    return aHas ? -1 : 1;

  }


  // 未設定または同順位の場合はID順
  return Number(a.id) -
         Number(b.id);

}


// =========================
// キッチンカー並び順
// =========================

function compareKitchenSort(a,b){

  const aSort =
    Number(a.kitchenSort);

  const bSort =
    Number(b.kitchenSort);


  const aHas =
    Number.isFinite(aSort);

  const bHas =
    Number.isFinite(bSort);


  // カー表示順がある商品を先に
  if(aHas && bHas){

    if(aSort !== bSort){

      return aSort - bSort;

    }

  }


  if(aHas !== bHas){

    return aHas ? -1 : 1;

  }


  // 未設定はID順
  return Number(a.id) -
         Number(b.id);

}


// =========================
// 商品表示
// =========================

function renderProducts(){

  const area =
    document.getElementById(
      "sortList"
    );


  if(!products.length){

    area.innerHTML = `

      <div class="loading">

        表示対象の商品がありません

      </div>

    `;

    return;

  }


  let html = "";


  products.forEach(
    (item,index)=>{

      html += `

<div class="sort-card">

  <div class="sort-number">

    現在位置：
    ${index + 1}

  </div>


  <div class="sort-name">

    ${escapeHtml(
      item.name || ""
    )}

  </div>


  <div class="sort-buttons">

    <button
      class="up-btn"
      onclick="moveProduct(
        ${index},
        -1
      )"
      ${index === 0 ? "disabled" : ""}
    >
      ↑ 上へ
    </button>


    <button
      class="down-btn"
      onclick="moveProduct(
        ${index},
        1
      )"
      ${index === products.length - 1 ? "disabled" : ""}
    >
      ↓ 下へ
    </button>

  </div>

</div>

`;

    }
  );


  area.innerHTML =
    html;

}


// =========================
// 並び替え
// =========================

function moveProduct(
  index,
  direction
){

  const newIndex =
    index + direction;


  if(
    newIndex < 0 ||
    newIndex >= products.length
  ){

    return;

  }


  const temp =
    products[index];


  products[index] =
    products[newIndex];


  products[newIndex] =
    temp;


  renderProducts();

}


// =========================
// 保存
// =========================

async function saveSort(){

  if(!products.length){

    return;

  }


  const button =
    document.getElementById(
      "saveButton"
    );


  button.disabled =
    true;

  button.textContent =
    "保存中...";


  try{

    const sortData =
      products.map(
        (item,index)=>{

          if(fromKitchen){

            return {

              id:item.id,

              kitchenSort:
                index + 1

            };

          }


          return {

            id:item.id,

            sort:
              index + 1

          };

        }
      );


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

              fromKitchen,

              products:
                sortData

            })

        }

      );


    const result =
      await res.json();


    if(!res.ok ||
       !result.success){

      throw new Error(

        result.message ||
        "保存失敗"

      );

    }


    alert(
      "表示順を保存しました"
    );


    await loadProducts();


  }catch(error){

    console.error(error);

    alert(
      error.message ||
      "保存に失敗しました"
    );


  }finally{

    button.disabled =
      false;

    button.textContent =
      "💾 表示順を保存";

  }

}


// =========================
// HTMLエスケープ
// =========================

function escapeHtml(value){

  return String(value)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}
