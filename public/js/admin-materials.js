// =========================
// 材料管理
// Ver.1.1
// =========================

let materials = [];

let filteredMaterials = [];

let editId = null;


// =========================
// 初期化
// =========================

window.addEventListener(

  "DOMContentLoaded",

  async ()=>{

    await loadMaterials();

  }

);


// =========================
// 材料取得
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

      throw new Error(
        "材料取得失敗"
      );

    }


    materials =
      await res.json();


    if(
      !Array.isArray(materials)
    ){

      materials = [];

    }


    // =========================
    // 材料CD順
    // M0001 → M0002
    // =========================

    materials.sort(

      (a,b)=>{

        const aNum =
          Number(
            String(a.id || "")
              .replace(/^M/, "")
          );

        const bNum =
          Number(
            String(b.id || "")
              .replace(/^M/, "")
          );

        return aNum - bNum;

      }

    );


    filteredMaterials =
      [...materials];


    renderMaterials();

  }


  catch(error){

    console.error(error);


    const list =
      document.getElementById(
        "materialList"
      );


    if(list){

      list.innerHTML =

      `

      <div class="card">

        材料一覧の取得に失敗しました。

      </div>

      `;

    }

  }

}


// =========================
// 一覧表示
// =========================

function renderMaterials(){

  const list =
    document.getElementById(
      "materialList"
    );


  if(!list){

    return;

  }


  if(
    filteredMaterials.length === 0
  ){

    list.innerHTML =

    `

    <div class="card">

      材料がありません。

    </div>

    `;

    return;

  }


  let html = "";


  filteredMaterials.forEach(

    item=>{

      const unit =
        item.useUnit || "";


      const unitCost =
        Number(
          item.unitCost || 0
        );


      html +=

      `

      <div class="material-card">

        <div class="material-card-header">

          <strong>

            ${escapeHtml(
              item.name || ""
            )}

          </strong>

          <span>

            ${escapeHtml(
              item.id || ""
            )}

          </span>

        </div>


        <div class="material-card-info">

          <div>

            分類：
            ${escapeHtml(
              item.category || ""
            )}

          </div>


          <div>

            使用：
            ${escapeHtml(
              item.use || ""
            )}

          </div>


          <div>

            使用単位：
            ${escapeHtml(
              unit
            )}

          </div>


          <div>

            仕入：
            ${escapeHtml(
              item.purchaseUnit || ""
            )}

            /

            ${Number(
              item.purchaseQty || 0
            )}

            ${escapeHtml(
              item.purchaseQtyUnit || ""
            )}

          </div>


          <div>

            仕入価格：
            ${Number(
              item.purchasePrice || 0
            ).toLocaleString()}
            円

          </div>


          <div>

            原価単価：
            ${unitCost.toFixed(3)}
            円/${escapeHtml(unit)}

          </div>


          <div>

            現在在庫：
            ${Number(
              item.stock || 0
            )}

            ${escapeHtml(unit)}

          </div>


          <div>

            発注点：
            ${Number(
              item.reorderPoint || 0
            )}

            ${escapeHtml(
              item.reorderUnit || unit
            )}

          </div>


          ${
            item.supplier
              ?
              `<div>
                仕入先：
                ${escapeHtml(
                  item.supplier
                )}
              </div>`
              :
              ""
          }


        </div>


        <div class="material-card-actions">

          <button
            type="button"
            onclick="openEditModal('${escapeHtml(
              item.id
            )}')"
          >

            編集

          </button>


          <button
            type="button"
            onclick="deleteMaterial('${escapeHtml(
              item.id
            )}')"
          >

            削除

          </button>

        </div>

      </div>

      `;

    }

  );


  list.innerHTML =
    html;

}


// =========================
// 検索
// =========================

function filterMaterials(){

  const keyword =

    document
      .getElementById(
        "searchText"
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

          String(
            item.name || ""
          )
          .toLowerCase()
          .includes(keyword)


          ||


          String(
            item.category || ""
          )
          .toLowerCase()
          .includes(keyword)


          ||


          String(
            item.id || ""
          )
          .toLowerCase()
          .includes(keyword)

      );

  }


  renderMaterials();

}


// =========================
// 新規追加
// =========================

function openAddModal(){

  editId = null;


  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "材料追加";


  document
    .getElementById(
      "materialForm"
    )
    .reset();


  document
    .getElementById(
      "materialId"
    )
    .value =
      "";


  document
    .getElementById(
      "unitCost"
    )
    .textContent =
      "0.000 円/g";


  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "block";


  calculateUnitCost();

}


// =========================
// 編集
// =========================

function openEditModal(id){

  editId = id;


  const item =

    materials.find(

      m=>

        String(m.id) ===
        String(id)

    );


  if(!item){

    return;

  }


  document
    .getElementById(
      "modalTitle"
    )
    .textContent =
      "材料編集";


  document
    .getElementById(
      "materialId"
    )
    .value =
      item.id || "";


  document
    .getElementById(
      "materialName"
    )
    .value =
      item.name || "";


  document
    .getElementById(
      "materialCategory"
    )
    .value =
      item.category || "その他";


  document
    .getElementById(
      "materialUse"
    )
    .value =
      item.use || "○";


  document
    .getElementById(
      "useUnit"
    )
    .value =
      item.useUnit || "g";


  document
    .getElementById(
      "purchaseUnit"
    )
    .value =
      item.purchaseUnit || "";


  document
    .getElementById(
      "purchaseQty"
    )
    .value =
      item.purchaseQty || "";


  // =========================
  // 仕入数量単位
  // =========================

  document
    .getElementById(
      "purchaseQtyUnit"
    )
    .value =
      item.purchaseQtyUnit ||
      item.useUnit ||
      "g";


  document
    .getElementById(
      "purchasePrice"
    )
    .value =
      item.purchasePrice || "";


  document
    .getElementById(
      "stock"
    )
    .value =
      item.stock || "";


  document
    .getElementById(
      "reorderPoint"
    )
    .value =
      item.reorderPoint || "";


  document
    .getElementById(
      "reorderUnit"
    )
    .value =
      item.reorderUnit ||
      item.useUnit ||
      "g";


  document
    .getElementById(
      "supplier"
    )
    .value =
      item.supplier || "";


  document
    .getElementById(
      "remarks"
    )
    .value =
      item.remarks || "";


  document
    .getElementById(
      "unitCost"
    )
    .textContent =

      item.unitCost
      ?

      `${Number(
        item.unitCost
      ).toFixed(3)}
      円/${item.useUnit || "g"}`

      :

      `0.000
      円/${item.useUnit || "g"}`;


  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "block";


  calculateUnitCost();

}


// =========================
// モーダルを閉じる
// =========================

function closeModal(){

  document
    .getElementById(
      "materialModal"
    )
    .style.display =
      "none";

}


// =========================
// 保存
// =========================

document
  .getElementById(
    "materialForm"
  )
  .addEventListener(

    "submit",

    async function(e){

      e.preventDefault();


      const data = {

        id:
          document
            .getElementById(
              "materialId"
            )
            .value,


        name:
          document
            .getElementById(
              "materialName"
            )
            .value
            .trim(),


        category:
          document
            .getElementById(
              "materialCategory"
            )
            .value,


        useUnit:
          document
            .getElementById(
              "useUnit"
            )
            .value,


        purchaseUnit:
          document
            .getElementById(
              "purchaseUnit"
            )
            .value,


        purchaseQty:
          Number(
            document
              .getElementById(
                "purchaseQty"
              )
              .value || 0
          ),


        // =========================
        // 仕入数量単位
        // =========================

        purchaseQtyUnit:
          document
            .getElementById(
              "purchaseQtyUnit"
            )
            .value,


        purchasePrice:
          Number(
            document
              .getElementById(
                "purchasePrice"
              )
              .value || 0
          ),


        stock:
          Number(
            document
              .getElementById(
                "stock"
              )
              .value || 0
          ),


        reorderPoint:
          Number(
            document
              .getElementById(
                "reorderPoint"
              )
              .value || 0
          ),


        reorderUnit:
          document
            .getElementById(
              "reorderUnit"
            )
            .value,


        supplier:
          document
            .getElementById(
              "supplier"
            )
            .value
            .trim(),


        use:
          document
            .getElementById(
              "materialUse"
            )
            .value,


        remarks:
          document
            .getElementById(
              "remarks"
            )
            .value
            .trim()

      };


      const url =

        editId

        ?

        "/api/materials/update"

        :

        "/api/materials";


      try{

        const res =
          await fetch(

            API_URL + url,

            {

              method:
                "POST",


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
                JSON.stringify(
                  data
                )

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


        closeModal();


        await loadMaterials();


        alert(
          "保存しました。"
        );

      }


      catch(error){

        console.error(
          error
        );


        alert(
          "保存に失敗しました。"
        );

      }

    }

  );


// =========================
// 削除
// =========================

async function deleteMaterial(id){

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
        "/api/materials/delete",

        {

          method:
            "POST",


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

              id:
                id

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
        "削除失敗"
      );

    }


    await loadMaterials();


    alert(
      "削除しました。"
    );

  }


  catch(error){

    console.error(
      error
    );


    alert(
      "削除できませんでした。"
    );

  }

}


// =========================
// 原価単価計算
// =========================

function calculateUnitCost(){

  const qty =
    Number(
      document
        .getElementById(
          "purchaseQty"
        )
        .value || 0
    );


  const price =
    Number(
      document
        .getElementById(
          "purchasePrice"
        )
        .value || 0
    );


  // =========================
  // 仕入数量単位を使用
  // =========================

  const purchaseQtyUnit =
    document
      .getElementById(
        "purchaseQtyUnit"
      )
      .value;


  const useUnit =
    document
      .getElementById(
        "useUnit"
      )
      .value;


  const result =
    convertToUseUnit(

      qty,

      purchaseQtyUnit,

      useUnit

    );


  const area =
    document
      .getElementById(
        "unitCost"
      );


  if(
    result <= 0 ||
    price <= 0
  ){

    area.textContent =
      `0.000 円/${useUnit}`;

    return;

  }


  const cost =
    price / result;


  area.textContent =
    `${cost.toFixed(3)} 円/${useUnit}`;

}


// =========================
// 単位換算
// =========================

function convertToUseUnit(

  qty,

  purchaseQtyUnit,

  useUnit

){

  if(
    purchaseQtyUnit ===
    useUnit
  ){

    return qty;

  }


  // =========================
  // kg → g
  // =========================

  if(
    purchaseQtyUnit === "kg" &&
    useUnit === "g"
  ){

    return qty * 1000;

  }


  // =========================
  // L → ml
  // =========================

  if(
    purchaseQtyUnit === "L" &&
    useUnit === "ml"
  ){

    return qty * 1000;

  }


  // =========================
  // 換算できない単位
  // =========================

  return 0;

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
