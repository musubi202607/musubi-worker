// ==================================================
// ダッシュボード Ver.3
// GAS getDashboard() Ver3 対応版
// ==================================================

let dashboardData = {};

let hourlyChart = null;


// =========================
// 初期化
// =========================

window.addEventListener(

  "DOMContentLoaded",

  () => {

    loadDashboard();

  }

);


// =========================
// ダッシュボード取得
// =========================

async function loadDashboard(){

  try{


    const token =

      localStorage.getItem(
        "adminToken"
      );


    const response =

      await fetch(

        API_URL +
        "/api/dashboard",

        {

          headers:{

            Authorization:

              "Bearer " +
              token

          }

        }

      );


    if(!response.ok){


      alert(
        "認証エラーです。"
      );


      location.href =
        "login.html";


      return;


    }


    dashboardData =

      await response.json();



    // =========================
    // 表示更新
    // =========================

    renderDashboard(
      dashboardData
    );


    renderYesterdayCard(
      dashboardData
    );


    renderHourlyChart(

      dashboardData.hourlyChart

    );


    renderTopProducts(

      dashboardData.topProducts

    );


    renderCategorySales(

      dashboardData.categorySales

    );


    updateDashboardInfo();


    loadWeather();


  }


  catch(error){


    console.error(error);


    alert(
      "ダッシュボードの取得に失敗しました。"
    );


  }


}



// =========================
// KPI表示
// =========================

function renderDashboard(data){



  setText(

    "reservationCount",

    data.reservationCount

  );



  setText(

    "checkedInCount",

    data.checkedInCount

  );



  setText(

    "visitRate",

    (data.visitRate || 0) + "%"

  );



  setText(

    "bbqUnpaidCount",

    data.bbqUnpaidCount

  );



  setText(

    "onigiriUnpaidCount",

    data.onigiriUnpaidCount

  );



  // =========================
  // 売上
  // =========================



  setText(

    "bbqSales",

    formatYen(
      data.bbqSales
    )

  );



  setText(

    "optionSales",

    formatYen(
      data.optionSales
    )

  );



  setText(

    "onigiriSales",

    formatYen(
      data.onigiriSales
    )

  );



  setText(

    "kitchenSales",

    formatYen(
      data.kitchenSales
    )

  );



  setText(

    "todaySales",

    formatYen(
      data.todaySales
    )

  );



  setText(

    "yesterdaySales",

    formatYen(
      data.yesterdaySales
    )

  );



  setText(

    "monthSales",

    formatYen(
      data.monthSales
    )

  );



  setText(

    "totalSales",

    formatYen(
      data.totalSales
    )

  );



  // =========================
  // BBQ状況
  // =========================


  setText(

    "bbqReservationCount",

    data.reservationCount

  );


  setText(

    "bbqCheckedInCount",

    data.checkedInCount

  );


  setText(

    "bbqWaitingPayment",

    data.bbqUnpaidCount

  );


}



// =========================
// 安全な文字設定
// =========================

function setText(id,value){


  const el =

    document.getElementById(id);



  if(!el){

    return;

  }


  el.innerText =

    value ?? 0;


}



// =========================
// 前日比較
// =========================

function renderYesterdayCard(data){


  const diff =

    document.getElementById(
      "salesDiff"
    );



  if(!diff){

    return;

  }



  const value =

    Number(
      data.salesDiff || 0
    );



  diff.innerText =

    value + "%";



  if(value > 0){


    diff.style.color =
      "#2e7d32";


  }

  else if(value < 0){


    diff.style.color =
      "#d32f2f";


  }

  else{


    diff.style.color =
      "#666";


  }


}



// =========================
// ダッシュボード情報
// =========================

function updateDashboardInfo(){


  const now =

    new Date();



  const date =

    document.getElementById(

      "dashboardDate"

    );



  if(date){


    date.innerText =

      now.toLocaleDateString(
        "ja-JP"
      );


  }



  const update =

    document.getElementById(

      "lastUpdate"

    );



  if(update){


    update.innerText =

      now.toLocaleTimeString(
        "ja-JP"
      );


  }


}

// =========================
// 時間帯別売上グラフ
// =========================

function renderHourlyChart(chartData){


  const canvas =

    document.getElementById(
      "hourlyChart"
    );


  if(
    !canvas ||
    !chartData
  ){

    return;

  }



  const ctx =

    canvas.getContext(
      "2d"
    );



  if(hourlyChart){

    hourlyChart.destroy();

  }



  hourlyChart =

    new Chart(

      ctx,

      {

        type:"bar",


        data:{


          labels:

            chartData.labels || [],



          datasets:[


            {


              label:"今日",


              data:

                chartData.today || [],



              backgroundColor:

                "#4CAF50"


            },


            {


              label:"昨日",


              data:

                chartData.yesterday || [],



              backgroundColor:

                "#90CAF9"


            }


          ]


        },


        options:{


          responsive:true,


          maintainAspectRatio:false,



          plugins:{


            legend:{


              position:"bottom"


            }


          },



          scales:{


            y:{


              beginAtZero:true,



              ticks:{


                callback:function(value){


                  return "¥" +

                    Number(value)

                    .toLocaleString();


                }


              }


            }


          }


        }


      }


    );


}



// =========================
// 人気商品 TOP5
// table対応
// =========================

function renderTopProducts(products){


  const tbody =

    document.getElementById(

      "topProducts"

    );



  if(!tbody){

    return;

  }



  tbody.innerHTML = "";



  if(
    !products ||
    products.length === 0
  ){


    tbody.innerHTML =


      `

      <tr>

        <td colspan="4">

          データがありません

        </td>

      </tr>

      `;


    return;


  }



  products.forEach(

    (item,index)=>{


      const tr =

        document.createElement(
          "tr"
        );



      tr.innerHTML =


        `

        <td>

          ${index + 1}

        </td>


        <td>

          ${item.name || ""}

        </td>


        <td>

          ${formatNumber(item.qty)}

        </td>


        <td>

          ${formatYen(item.sales)}

        </td>


        `;



      tbody.appendChild(
        tr
      );


    }

  );


}



// =========================
// カテゴリ売上
// table対応
// =========================

function renderCategorySales(categories){


  const tbody =

    document.getElementById(

      "categorySales"

    );



  if(!tbody){

    return;

  }



  tbody.innerHTML = "";



  if(
    !categories ||
    categories.length === 0
  ){


    tbody.innerHTML =


      `

      <tr>

        <td colspan="2">

          データがありません

        </td>


      </tr>

      `;


    return;


  }



  categories.forEach(

    item=>{


      const tr =

        document.createElement(
          "tr"
        );



      tr.innerHTML =


        `

        <td>

          ${item.category || ""}

        </td>


        <td>

          ${formatYen(item.amount)}

        </td>


        `;



      tbody.appendChild(
        tr
      );


    }

  );


}



// =========================
// 金額表示
// =========================

function formatYen(value){


  return "¥" +

    Number(
      value || 0
    )

    .toLocaleString();


}



// =========================
// 数値表示
// =========================

function formatNumber(value){


  return Number(

    value || 0

  )

  .toLocaleString();


}

// =========================
// 天気取得
// =========================

async function loadWeather(){


  const weatherText =

    document.getElementById(
      "weatherText"
    );


  const weatherTemp =

    document.getElementById(
      "weatherTemp"
    );



  if(
    !weatherText ||
    !weatherTemp
  ){

    return;

  }



  try{


    const response =

      await fetch(

        "https://api.open-meteo.com/v1/forecast?latitude=34.6618&longitude=133.9350&current=temperature_2m,weather_code"

      );



    if(!response.ok){


      throw new Error(

        "Weather Error"

      );


    }



    const data =

      await response.json();



    const current =

      data.current || {};



    weatherText.innerText =

      weatherName(

        current.weather_code

      );



    weatherTemp.innerText =


      Number(

        current.temperature_2m || 0

      )

      .toFixed(1)

      + "℃";


  }


  catch(error){


    console.error(error);



    weatherText.innerText =

      "取得失敗";



    weatherTemp.innerText =

      "--℃";


  }


}



// =========================
// 天気コード変換
// =========================

function weatherName(code){


  switch(Number(code)){


    case 0:

      return "☀ 快晴";


    case 1:

    case 2:

      return "🌤 晴れ";


    case 3:

      return "☁ 曇り";


    case 45:

    case 48:

      return "🌫 霧";


    case 51:

    case 53:

    case 55:

      return "🌦 小雨";


    case 61:

    case 63:

    case 65:

      return "🌧 雨";


    case 71:

    case 73:

    case 75:

      return "❄ 雪";


    case 80:

    case 81:

    case 82:

      return "🌦 にわか雨";


    case 95:

    case 96:

    case 99:

      return "⛈ 雷雨";


    default:

      return "－";


  }


}



// =========================
// ダッシュボード再読込
// =========================

function reloadDashboard(){


  loadDashboard();


}



// =========================
// 自動更新
// 5分
// =========================

setInterval(


  reloadDashboard,


  1000 * 60 * 5


);



// =========================
// 表示復帰時更新
// =========================

document.addEventListener(


  "visibilitychange",


  ()=>{


    if(

      document.visibilityState ===

      "visible"

    ){


      reloadDashboard();


    }


  }


);



// =========================
// リサイズ時
// Chart再描画
// =========================

window.addEventListener(


  "resize",


  ()=>{


    if(

      dashboardData.hourlyChart

    ){


      renderHourlyChart(

        dashboardData.hourlyChart

      );


    }


  }


);



// =========================
// 読み込み完了
// =========================

console.log(

  "Dashboard Ver.3 Loaded"

);
