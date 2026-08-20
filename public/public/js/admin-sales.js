// ==================================================
// admin-sales.js
// 売上確認 Ver.2.2
// 粗利対応・安全版
// ==================================================

let currentTab = "store";

let storeAnalysisProducts = [];

let kitchenAnalysisProducts = [];

let totalAnalysisProducts = [];

// =========================
// 初期化
// =========================

window.addEventListener("DOMContentLoaded", () => {

  showSalesTab("store");

  setTimeout(() => {
    setThisMonth();
  }, 500);

});

// =========================
// 数値安全変換
// =========================

function safeNumber(value) {

  const num = Number(value);

  return Number.isFinite(num)
    ? num
    : 0;

}

// =========================
// 金額表示
// =========================

function formatYen(value) {

  return (
    "¥" +
    Math.round(
      safeNumber(value)
    ).toLocaleString()
  );

}

// =========================
// タブ切替
// =========================

function showSalesTab(tab) {

  currentTab = tab;

  document
    .querySelectorAll(".tab-content")
    .forEach(el => {
      el.classList.remove("active");
    });

  document
    .querySelectorAll(".tab-btn")
    .forEach(el => {
      el.classList.remove("active");
    });

  if(tab === "store") {

    const tabContent =
      document.getElementById("storeTab");

    const button =
      document.getElementById("tabStore");

    if(tabContent) {
      tabContent.classList.add("active");
    }

    if(button) {
      button.classList.add("active");
    }

  }

  if(tab === "kitchen") {

    const tabContent =
      document.getElementById("kitchenTab");

    const button =
      document.getElementById("tabKitchen");

    if(tabContent) {
      tabContent.classList.add("active");
    }

    if(button) {
      button.classList.add("active");
    }

  }

  if(tab === "total") {

    const tabContent =
      document.getElementById("totalTab");

    const button =
      document.getElementById("tabTotal");

    if(tabContent) {
      tabContent.classList.add("active");
    }

    if(button) {
      button.classList.add("active");
    }

  }

}

// =========================
// 日付フォーマット
// =========================

function formatDate(date) {

  const y =
    date.getFullYear();

  const m =
    String(date.getMonth() + 1)
      .padStart(2,"0");

  const d =
    String(date.getDate())
      .padStart(2,"0");

  return y + "-" + m + "-" + d;

}

// =========================
// 当日
// =========================

function setToday() {

  const today = new Date();

  const start =
    document.getElementById("startDate");

  const end =
    document.getElementById("endDate");

  if(start) {
    start.value = formatDate(today);
  }

  if(end) {
    end.value = formatDate(today);
  }

  loadSales();

}

// =========================
// 当月
// =========================

function setThisMonth() {

  const today = new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

  const startElement =
    document.getElementById("startDate");

  const endElement =
    document.getElementById("endDate");

  if(startElement) {
    startElement.value =
      formatDate(start);
  }

  if(endElement) {
    endElement.value =
      formatDate(today);
  }

  loadSales();

}

// =========================
// 前月
// =========================

function setLastMonth() {

  const today = new Date();

  const start =
    new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );

  const end =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );

  const startElement =
    document.getElementById("startDate");

  const endElement =
    document.getElementById("endDate");

  if(startElement) {
    startElement.value =
      formatDate(start);
  }

  if(endElement) {
    endElement.value =
      formatDate(end);
  }

  loadSales();

}

// =========================
// 売上集計
// =========================

async function loadSales() {

  const loading =
    document.getElementById("salesLoading");

  if(loading) {
    loading.classList.add("show");
  }

  try {

    const startElement =
      document.getElementById("startDate");

    const endElement =
      document.getElementById("endDate");

    const startDate =
      startElement
        ? startElement.value
        : "";

    const endDate =
      endElement
        ? endElement.value
        : "";

    if(!startDate || !endDate) {

      alert("期間を指定してください");

      return;

    }

    // =========================
    // API
    // =========================

    const res =
      await fetch(
        API_URL + "/api/sales",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )
          },

          body:
            JSON.stringify({
              startDate,
              endDate
            })
        }
      );

    const responseText =
      await res.text();

        if(!res.ok) {

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    let data;

    try {

      data =
        JSON.parse(responseText);

    }
    catch(error) {

      console.error(
        "JSON解析エラー:",
        error
      );

      throw new Error(
        "売上APIから正しいJSONが返っていません"
      );

    }

    if(
      data &&
      data.success === false
    ) {

      throw new Error(
        data.message ||
        "売上APIエラー"
      );

    }

    if(!data) {

      throw new Error(
        "売上データがありません"
      );

    }

    // =========================
    // 店舗
    // =========================

    const store =
      data.store || {};

    const storeProducts =
      Array.isArray(store.products)
        ? store.products
        : [];

    const storeOnigiriSales =
      safeNumber(
        store.onigiriSales
      );

    const storeBbqSales =
      safeNumber(
        store.bbqSales
      );

    const storeOptionSales =
      safeNumber(
        store.optionSales
      );

    const storeTotalSales =
      safeNumber(
        store.totalSales
      );

    const storeTotalCost =
      safeNumber(
        store.totalCost
      );

    const storeGrossProfit =
      safeNumber(
        store.grossProfit
      );

    // =========================
    // 店舗売上
    // =========================

    const onigiriSales =
      document.getElementById(
        "onigiriSales"
      );

    if(onigiriSales) {

      onigiriSales.innerText =
        formatYen(
          storeOnigiriSales
        );

    }

    const bbqSales =
      document.getElementById(
        "bbqSales"
      );

    if(bbqSales) {

      bbqSales.innerText =
        formatYen(
          storeBbqSales
        );

    }

    const optionSales =
      document.getElementById(
        "optionSales"
      );

    if(optionSales) {

      optionSales.innerText =
        formatYen(
          storeOptionSales
        );

    }

    const storeTotal =
      document.getElementById(
        "storeTotalSales"
      );

    if(storeTotal) {

      storeTotal.innerText =
        formatYen(
          storeTotalSales
        );

    }

    // =========================
    // 店舗原価
    // =========================

    const storeCost =
      document.getElementById(
        "storeTotalCost"
      );

    if(storeCost) {

      storeCost.innerText =
        formatYen(
          storeTotalCost
        );

    }

    // =========================
    // 店舗粗利
    // =========================

    const storeGross =
      document.getElementById(
        "storeGrossProfit"
      );

    if(storeGross) {

      storeGross.innerText =
        formatYen(
          storeGrossProfit
        );

    }

    // =========================
    // 店舗商品別
    // =========================

    displayProductSales(
      "storeProductSales",
      storeProducts
    );

    // =========================
    // キッチンカー
    // =========================

    const kitchen =
      data.kitchen || {};

    const kitchenProducts =
      Array.isArray(
        kitchen.products
      )
        ? kitchen.products
        : [];

    const kitchenTotalSales =
      safeNumber(
        kitchen.totalSales
      );

    const kitchenTotalCost =
      safeNumber(
        kitchen.totalCost
      );

    const kitchenGrossProfit =
      safeNumber(
        kitchen.grossProfit
      );

    const kitchenTotal =
      document.getElementById(
        "kitchenTotalSales"
      );

    if(kitchenTotal) {

      kitchenTotal.innerText =
        formatYen(
          kitchenTotalSales
        );

    }

    const kitchenCost =
      document.getElementById(
        "kitchenTotalCost"
      );

    if(kitchenCost) {

      kitchenCost.innerText =
        formatYen(
          kitchenTotalCost
        );

    }

    const kitchenGross =
      document.getElementById(
        "kitchenGrossProfit"
      );

    if(kitchenGross) {

      kitchenGross.innerText =
        formatYen(
          kitchenGrossProfit
        );

    }

    // =========================
    // キッチンカー商品別
    // =========================

    displayProductSales(
      "kitchenProductSales",
      kitchenProducts
    );

    // =========================
    // 総合
    // =========================

    const total =
      data.total || {};

    const grandTotalSales =
      safeNumber(
        total.totalSales
      );

    const grandTotalCost =
      safeNumber(
        total.totalCost
      );

    const grandGrossProfit =
      safeNumber(
        total.grossProfit
      );

    // =========================
    // 総合 店舗売上
    // =========================

    const totalStore =
      document.getElementById(
        "totalStoreSales"
      );

    if(totalStore) {

      totalStore.innerText =
        formatYen(
          storeTotalSales
        );

    }

    // =========================
    // 総合 キッチンカー売上
    // =========================

    const totalKitchen =
      document.getElementById(
        "totalKitchenSales"
      );

    if(totalKitchen) {

      totalKitchen.innerText =
        formatYen(
          kitchenTotalSales
        );

    }

    // =========================
    // 総合売上
    // =========================

    const grandTotal =
      document.getElementById(
        "grandTotalSales"
      );

    if(grandTotal) {

      grandTotal.innerText =
        formatYen(
          grandTotalSales
        );

    }

    // =========================
    // 総合原価
    // =========================

    const grandCost =
      document.getElementById(
        "grandTotalCost"
      );

    if(grandCost) {

      grandCost.innerText =
        formatYen(
          grandTotalCost
        );

    }

    // =========================
    // 総合粗利
    // =========================

    const grandGross =
      document.getElementById(
        "grandGrossProfit"
      );

    if(grandGross) {

      grandGross.innerText =
        formatYen(
          grandGrossProfit
        );

    }

// =========================
// 総合 商品別
// =========================

displayProductSales(
  "totalStoreProductSales",
  storeProducts
);

displayProductSales(
  "totalKitchenProductSales",
  kitchenProducts
);

const totalProducts =
  mergeProducts(
    storeProducts,
    kitchenProducts
  );


// =========================
// 商品分析データ保持
// =========================

storeAnalysisProducts =
  mergeProducts(
    storeProducts,
    []
  );


kitchenAnalysisProducts =
  mergeProducts(
    kitchenProducts,
    []
  );


totalAnalysisProducts =
  totalProducts;


// =========================
// カテゴリ分析
// =========================

displayCategoryAnalysis(
  "storeCategoryAnalysis",
  storeAnalysisProducts
);


displayCategoryAnalysis(
  "kitchenCategoryAnalysis",
  kitchenAnalysisProducts
);

// =========================
// 総販売数量
// =========================

const grandTotalQty =
  document.getElementById(
    "grandTotalQty"
  );


if(grandTotalQty){

  const qty =
    totalProducts.reduce(
      (sum,item)=>
        sum + safeNumber(item.qty),
      0
    );


  grandTotalQty.innerText =
    qty + "個";

}


// =========================
// 分析初期表示
// =========================

updateStoreAnalysis();

updateKitchenAnalysis();

updateAnalysis();

updateCategoryAnalysis();
    
} 
  
  catch(e) {
    

  console.error(
    "売上集計エラー:",
    e
  );

  alert(
    "売上取得中にエラーが発生しました\n\n" +
    e.message
  );

} finally {

  if(loading){
    loading.classList.remove("show");
  }
}
}
// =========================
// 店舗売上取得
// =========================

async function loadStoreSales(
  startDate,
  endDate
) {

  try {

    const res =
      await fetch(
        API_URL + "/api/sales",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )
          },

          body:
            JSON.stringify({
              startDate,
              endDate
            })
        }
      );

    const responseText =
      await res.text();

    if(!res.ok) {

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    const data =
      JSON.parse(responseText);

    const store =
      data.store || {};

    const products =
      Array.isArray(store.products)
        ? store.products
        : [];

    const total =
      safeNumber(
        store.totalSales
      );

    const cost =
      safeNumber(
        store.totalCost
      );

    const grossProfit =
      safeNumber(
        store.grossProfit
      );

    const onigiri =
      document.getElementById(
        "onigiriSales"
      );

    if(onigiri) {

      onigiri.innerText =
        formatYen(
          store.onigiriSales
        );

    }

    const bbq =
      document.getElementById(
        "bbqSales"
      );

    if(bbq) {

      bbq.innerText =
        formatYen(
          store.bbqSales
        );

    }

    const option =
      document.getElementById(
        "optionSales"
      );

    if(option) {

      option.innerText =
        formatYen(
          store.optionSales
        );

    }

    const storeTotal =
      document.getElementById(
        "storeTotalSales"
      );

    if(storeTotal) {

      storeTotal.innerText =
        formatYen(total);

    }

    const storeCost =
      document.getElementById(
        "storeTotalCost"
      );

    if(storeCost) {

      storeCost.innerText =
        formatYen(cost);

    }

    const storeGross =
      document.getElementById(
        "storeGrossProfit"
      );

    if(storeGross) {

      storeGross.innerText =
        formatYen(
          grossProfit
        );

    }

    displayProductSales(
      "storeProductSales",
      products
    );

    return {
      total,
      cost,
      grossProfit,
      products
    };

  }
  catch(e) {

    console.error(
      "店舗売上取得エラー:",
      e
    );

    return {
      total:0,
      cost:0,
      grossProfit:0,
      products:[]
    };

  }

}

// =========================
// キッチンカー売上取得
// =========================

async function loadKitchenSales(
  startDate,
  endDate
) {

  try {

    const res =
      await fetch(
        API_URL + "/api/sales",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem(
                "adminToken"
              )
          },

          body:
            JSON.stringify({
              startDate,
              endDate
            })
        }
      );

    const responseText =
      await res.text();

    if(!res.ok) {

      throw new Error(
        "売上APIエラー: " +
        res.status +
        " " +
        responseText
      );

    }

    const data =
      JSON.parse(responseText);

    const kitchen =
      data.kitchen || {};

    const products =
      Array.isArray(
        kitchen.products
      )
        ? kitchen.products
        : [];

    const total =
      safeNumber(
        kitchen.totalSales
      );

    const cost =
      safeNumber(
        kitchen.totalCost
      );

    const grossProfit =
      safeNumber(
        kitchen.grossProfit
      );

    const kitchenTotal =
      document.getElementById(
        "kitchenTotalSales"
      );

    if(kitchenTotal) {

      kitchenTotal.innerText =
        formatYen(total);

    }

    const kitchenCost =
      document.getElementById(
        "kitchenTotalCost"
      );

    if(kitchenCost) {

      kitchenCost.innerText =
        formatYen(cost);

    }

    const kitchenGross =
      document.getElementById(
        "kitchenGrossProfit"
      );

    if(kitchenGross) {

      kitchenGross.innerText =
        formatYen(
          grossProfit
        );

    }

    displayProductSales(
      "kitchenProductSales",
      products
    );

    return {
      total,
      cost,
      grossProfit,
      products
    };

  }
  catch(e) {

    console.error(
      "キッチンカー売上取得エラー:",
      e
    );

    return {
      total:0,
      cost:0,
      grossProfit:0,
      products:[]
    };

  }

}

// =========================
// 総合売上更新
// =========================

function updateTotalSales(
  kitchenTotal
) {

  const storeElement =
    document.getElementById(
      "storeTotalSales"
    );

  let storeTotal = 0;

  if(storeElement) {

    const text =
      String(
        storeElement.innerText
      );

    storeTotal =
      safeNumber(
        text.replace(
          /[^0-9.-]/g,
          ""
        )
      );

  }

  const kitchenValue =
    safeNumber(
      kitchenTotal
    );

  const totalStore =
    document.getElementById(
      "totalStoreSales"
    );

  if(totalStore) {

    totalStore.innerText =
      formatYen(
        storeTotal
      );

  }

  const totalKitchen =
    document.getElementById(
      "totalKitchenSales"
    );

  if(totalKitchen) {

    totalKitchen.innerText =
      formatYen(
        kitchenValue
      );

  }

  const grandTotal =
    document.getElementById(
      "grandTotalSales"
    );

  if(grandTotal) {

    grandTotal.innerText =
      formatYen(
        storeTotal +
        kitchenValue
      );

  }

}

// =========================
// 商品別売上表示
// =========================

function displayProductSales(
  targetId,
  products
) {

  const area =
    document.getElementById(
      targetId
    );

  if(!area) {

    console.warn(
      "商品別売上表示先が見つかりません:",
      targetId
    );

    return;

  }

  area.innerHTML = "";

  if(
    !Array.isArray(products) ||
    products.length === 0
  ) {

    const tr =
      document.createElement("tr");

    const td =
      document.createElement("td");

    td.colSpan = 5;

    td.textContent =
      "データがありません";

    tr.appendChild(td);

    area.appendChild(tr);

    return;

  }

  products.forEach(item => {

    const tr =
      document.createElement("tr");

    // 商品名
    const nameTd =
      document.createElement("td");

    nameTd.textContent =
      item.name || "";

    // 数量
    const qtyTd =
      document.createElement("td");

    qtyTd.textContent =
      safeNumber(item.qty) +
      "個";

    // 売上
    const amountTd =
      document.createElement("td");

    amountTd.textContent =
      formatYen(
        item.amount
      );

    // 原価
    const costTd =
      document.createElement("td");

    costTd.textContent =
      formatYen(
        item.costTotal
      );

    // 粗利
    const grossProfitTd =
      document.createElement("td");

    grossProfitTd.textContent =
      formatYen(
        item.grossProfit
      );

    tr.appendChild(nameTd);
    tr.appendChild(qtyTd);
    tr.appendChild(amountTd);
    tr.appendChild(costTd);
    tr.appendChild(grossProfitTd);

    area.appendChild(tr);

  });

}

// =========================
// キッチンカー商品別表示
// =========================

function displayKitchenProducts(
  products
) {

  displayProductSales(
    "kitchenProductSales",
    products
  );

}

function getCategoryName(item){

  const type =
    item.category ||
    item.type ||
    "";

  switch(type){

    case "onigiri":
      return "おにぎり";

    case "bbq":
      return "BBQ";

    case "bbq-option":
      return "BBQオプション";

    case "drink":
      return "ドリンク";

    default:
      return "その他";

  }

}

// =========================
// 総合商品集計
// =========================
function mergeProducts(
  storeProducts,
  kitchenProducts
){

  const result = {};

  const list = [

    ...(Array.isArray(storeProducts)
      ? storeProducts
      : []),

    ...(Array.isArray(kitchenProducts)
      ? kitchenProducts
      : [])

  ];

  list.forEach(item=>{

    const name =
      item.name || "";

    if(!result[name]){

      result[name] = {

        name,

        // 商品カテゴリ
        category:
         getCategoryName(item),
        qty:0,

        amount:0,

        cost:0,

        costTotal:0,

        grossProfit:0

      };

    }

    result[name].qty +=
      safeNumber(item.qty);

    result[name].amount +=
      safeNumber(item.amount);

    result[name].cost +=
      safeNumber(item.cost);

    result[name].costTotal +=
      safeNumber(item.costTotal);

    result[name].grossProfit +=
      safeNumber(item.grossProfit);

  });

  return Object.values(result);

}

// =========================
// 商品カテゴリ分析表示
// =========================
function displayCategoryAnalysis(
  targetId,
  products,
  sort = "amount"
){

  const tbody =
    document.getElementById(targetId);

  if(!tbody){
    return;
  }

  tbody.innerHTML = "";

  if(
    !Array.isArray(products) ||
    products.length === 0
  ){

    tbody.innerHTML =
      "<tr><td colspan='7'>データがありません</td></tr>";

    return;

  }

  const categoryMap = {};

  products.forEach(item=>{

    const category =
      item.category || "その他";

    if(!categoryMap[category]){

      categoryMap[category] = {

        category,

        qty:0,

        amount:0,

        costTotal:0,

        grossProfit:0

      };

    }

    categoryMap[category].qty +=
      safeNumber(item.qty);

    categoryMap[category].amount +=
      safeNumber(item.amount);

    categoryMap[category].costTotal +=
      safeNumber(item.costTotal);

    categoryMap[category].grossProfit +=
      safeNumber(item.grossProfit);

  });

  const list =
    Object.values(categoryMap);

  const totalAmount =
    list.reduce(
      (sum,item)=>
        sum + safeNumber(item.amount),
      0
    );

  list.sort((a,b)=>{

    switch(sort){

      case "qty":
        return b.qty - a.qty;

      case "grossProfit":
        return b.grossProfit - a.grossProfit;

      case "cost":
        return b.costTotal - a.costTotal;

      default:
        return b.amount - a.amount;

    }

  });

  list.forEach(item=>{

    const ratio =
      totalAmount > 0
      ? item.amount / totalAmount * 100
      : 0;

    const grossRate =
      item.amount > 0
      ? item.grossProfit / item.amount * 100
      : 0;

    tbody.innerHTML += `
<tr>
<td>${item.category}</td>
<td>${item.qty}個</td>
<td>${formatYen(item.amount)}</td>
<td>${ratio.toFixed(1)}%</td>
<td>${formatYen(item.costTotal)}</td>
<td>${formatYen(item.grossProfit)}</td>
<td>${grossRate.toFixed(1)}%</td>
</tr>`;
  });

}
// =========================
// CSV出力
// =========================

async function downloadSalesCSV() {

  const startElement =
    document.getElementById(
      "startDate"
    );

  const endElement =
    document.getElementById(
      "endDate"
    );

  const startDate =
    startElement
      ? startElement.value
      : "";

  const endDate =
    endElement
      ? endElement.value
      : "";

  const token =
    localStorage.getItem(
      "adminToken"
    );

  if(!startDate || !endDate) {

    alert(
      "期間を指定してください"
    );

    return;

  }

  try {

    const res =
      await fetch(
        API_URL + "/api/sales/csv",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              token
          },

          body:
            JSON.stringify({
              startDate,
              endDate
            })
        }
      );

    const responseText =
      await res.text();

    if(!res.ok) {

      console.error(
        "CSV APIエラー:",
        res.status,
        responseText
      );

      alert(
        "CSV作成に失敗しました\n" +
        res.status
      );

      return;

    }

    let data;

    try {

      data =
        JSON.parse(responseText);

    }
    catch(error) {

      console.error(
        "CSV JSON解析エラー:",
        error
      );

      alert(
        "CSV APIから正しいデータが返っていません"
      );

      return;

    }

    if(!data || !data.success) {

      alert(
        "CSV作成失敗"
      );

      return;

    }

    if(!Array.isArray(data.csv)) {

      alert(
        "CSVデータが正しくありません"
      );

      return;

    }

    const csv =
      data.csv
        .map(row => {

          return row
            .map(value => {

              return '"' +
                String(value)
                  .replace(
                    /"/g,
                    '""'
                  ) +
                '"';

            })
            .join(",");

        })
        .join("\n");

    const blob =
      new Blob(
        [
          "\uFEFF" +
          csv
        ],
        {
          type:
            "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "売上履歴_" +
      startDate +
      "_" +
      endDate +
      ".csv";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);

  }
  catch(e) {

    console.error(
      "CSV出力エラー:",
      e
    );

    alert(
      "CSV作成中にエラーが発生しました"
    );

  }

}

function renderAnalysisTable(
  tableId,
  products,
  sortId
){

  const tbody =
    document.getElementById(tableId);

  if(!tbody){
    return;
  }

  tbody.innerHTML = "";

const sort =
  document.getElementById(sortId)?.value
  || "amount";

const list = [...products];

list.sort((a,b)=>{

  if(sort === "grossRate"){

    const rateA =
      safeNumber(a.amount) === 0
        ? 0
        : safeNumber(a.grossProfit) /
          safeNumber(a.amount);

    const rateB =
      safeNumber(b.amount) === 0
        ? 0
        : safeNumber(b.grossProfit) /
          safeNumber(b.amount);

    return rateB - rateA;

  }

  return (
    safeNumber(b[sort]) -
    safeNumber(a[sort])
  );

});
  
  list.forEach((item,index)=>{

    const rate =
      safeNumber(item.amount) > 0
      ? item.grossProfit /
        item.amount * 100
      : 0;

    tbody.innerHTML += `
<tr>
<td>${index+1}</td>
<td>${item.name}</td>
<td>${item.category || "その他"}</td>
<td>${safeNumber(item.qty)}個</td>
<td>${formatYen(item.amount)}</td>
<td>${formatYen(item.costTotal)}</td>
<td>${formatYen(item.grossProfit)}</td>
<td>${rate.toFixed(1)}%</td>
</tr>`;
  });

}

function updateStoreAnalysis(){

  renderAnalysisTable(
    "storeAnalysisTable",
    storeAnalysisProducts,
    "storeAnalysisSort"
  );

}

function updateKitchenAnalysis(){

  renderAnalysisTable(
    "kitchenAnalysisTable",
    kitchenAnalysisProducts,
    "kitchenAnalysisSort"
  );

}

// =========================
// 総合 商品分析ランキング
// =========================
function updateAnalysis(){

  renderAnalysisTable(
    "analysisTable",
    totalAnalysisProducts,
    "analysisSort"
  );

}
// =========================
// カテゴリ分析更新
// =========================
function updateCategoryAnalysis(){

  const sort =
    document.getElementById(
      "categorySort"
    )?.value || "amount";

  displayCategoryAnalysis(
    "categoryAnalysis",
    totalAnalysisProducts,
    sort
  );

}
