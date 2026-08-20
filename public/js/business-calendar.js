// =========================
// business-calendar.js
// 店舗営業日管理
// Cloudflare Workers版
// =========================

let businessCalendarData = [];

let businessCurrentMonth = new Date();

let businessLoading = false;

// =========================
// 更新表示
// =========================
function showBusinessLoading(){

  const bar =
    document.getElementById(
      "businessLoadingBar"
    );

  if(bar){

    bar.style.display =
      "block";

  }

}


function hideBusinessLoading(){

  const bar =
    document.getElementById(
      "businessLoadingBar"
    );

  if(bar){

    bar.style.display =
      "none";

  }

}

// =========================
// 初期化
// =========================
window.onload = async () => {

  await loadBusinessCalendar();

};

// =========================
// 店休日取得
// =========================
async function loadBusinessCalendar() {
  
  const token =
  localStorage.getItem("adminToken");

if(!token){

  location.href =
    "admin-login.html";

  return;

}

  try {

    businessLoading = true;

    const token =
     localStorage.getItem("adminToken");


  const response =
    await fetch(
      API_URL +
      "/api/store-business-calendar",
      {
        headers:{
          "Authorization":
            "Bearer " + token
        }
      }
    );

    if (!response.ok) {

      throw new Error(
        "営業日取得失敗"
      );

    }

    businessCalendarData =
      await response.json();

    if (!Array.isArray(businessCalendarData)) {

      businessCalendarData = [];

    }

    renderBusinessCalendar();

  } catch (e) {

    console.error(e);

    alert("営業日取得エラー");

  } finally {

  businessLoading = false;

  hideBusinessLoading();

}

}

// =========================
// YYYY-MM-DD
// =========================
function formatDate(date) {

  return (

    date.getFullYear()

    + "-"

    + String(
      date.getMonth() + 1
    ).padStart(2, "0")

    + "-"

    + String(
      date.getDate()
    ).padStart(2, "0")

  );

}

// =========================
// 店休日判定
// =========================
function isHoliday(dateStr) {

  return businessCalendarData.some(

    row =>

      row.date === dateStr &&

      row.status === "店休日"

  );

}

// =========================
// 今日判定
// =========================
function isToday(dateObj) {

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return (

    dateObj.getTime() ===

    today.getTime()

  );

}

// =========================
// 月情報取得
// =========================
function getMonthInfo() {

  const year =
    businessCurrentMonth.getFullYear();

  const month =
    businessCurrentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const lastDay =
    new Date(
      year,
      month + 1,
      0
    );

  return {

    year,

    month,

    firstDay,

    lastDay,

    startDay:
      firstDay.getDay(),

    totalDays:
      lastDay.getDate()

  };

}

// =========================
// カレンダー描画
// =========================
function renderBusinessCalendar() {

  const target =
    document.getElementById(
      "businessCalendar"
    );

  if (!target) {

    return;

  }

  const {

    year,

    month,

    startDay,

    totalDays

  } = getMonthInfo();

  let html = `

<div class="calendar-header">

<button
type="button"
onclick="prevBusinessMonth()">

←

</button>

<h2>

${year}年 ${month + 1}月

</h2>

<div class="calendar-header-right">

<button
type="button"
onclick="goTodayBusiness()">

今日

</button>

<button
type="button"
onclick="nextBusinessMonth()">

→

</button>

</div>

</div>

<div class="calendar-grid">

<div class="calendar-week">日</div>
<div class="calendar-week">月</div>
<div class="calendar-week">火</div>
<div class="calendar-week">水</div>
<div class="calendar-week">木</div>
<div class="calendar-week">金</div>
<div class="calendar-week">土</div>

`;

  // 月初空白
  for (
    let i = 0;
    i < startDay;
    i++
  ) {

    html += "<div></div>";

  }

  // 日付
  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const dateObj =
      new Date(
        year,
        month,
        day
      );

    dateObj.setHours(
      0,
      0,
      0,
      0
    );

    const dateStr =
      formatDate(
        dateObj
      );

    const holiday =
      isHoliday(
        dateStr
      );

    let className =
      "calendar-day";

    className +=
      holiday
        ? " holiday"
        : " business";

    if (
      isToday(dateObj)
    ) {

      className +=
        " today";

    }

    html += `

<button

type="button"

class="${className}"

onclick="toggleBusiness('${dateStr}')"

>

<div class="calendar-date">

${day}

</div>

<div class="calendar-status">

${holiday ? "店休日" : "営業日"}

</div>

</button>

`;

  }

  html += `

</div>

<div class="calendar-legend">

<span class="legend-business">

営業日

</span>

<span class="legend-holiday">

店休日

</span>

</div>

`;

  target.innerHTML = html;

}

// =========================
// 前月
// =========================
function prevBusinessMonth() {

  businessCurrentMonth.setMonth(

    businessCurrentMonth.getMonth() - 1

  );

  renderBusinessCalendar();

}

// =========================
// 翌月
// =========================
function nextBusinessMonth() {

  businessCurrentMonth.setMonth(

    businessCurrentMonth.getMonth() + 1

  );

  renderBusinessCalendar();

}

// =========================
// 今日へ戻る
// =========================
function goTodayBusiness() {

  businessCurrentMonth =

    new Date();

  renderBusinessCalendar();

}

// =========================
// 営業日データ再取得
// =========================
async function reloadBusinessCalendar() {

  await loadBusinessCalendar();

}

// =========================
// 指定日の状態取得
// =========================
function getBusinessStatus(date) {

  return isHoliday(date)

    ? "店休日"

    : "営業日";

}

// =========================
// 年月指定で移動
// =========================
function moveBusinessMonth(year, month) {

  businessCurrentMonth =

    new Date(

      year,

      month - 1,

      1

    );

  renderBusinessCalendar();

}

// =========================
// 今月へ戻る
// =========================
function resetBusinessCalendar() {

  businessCurrentMonth =

    new Date();

  renderBusinessCalendar();

}

// =========================
// カレンダー再読込
// =========================
async function refreshBusinessCalendar() {

  if (businessLoading) {

    return;

  }

  await loadBusinessCalendar();

}

// =========================
// 営業日切替
// =========================
async function toggleBusiness(date) {

  // 二重クリック防止
  if (businessLoading) {

    return;

  }

    businessLoading = true;

    showBusinessLoading();

  try {

    const holiday =
      isHoliday(date);

    let response;

    // =========================
    // 営業日 → 店休日登録
    // =========================
    if (!holiday) {

      response =
        await fetch(

          API_URL +
          "/api/store-business-calendar",

          {

            method: "POST",

            headers: {

            "Content-Type":
              "application/json",

            "Authorization":
              "Bearer " +
              localStorage.getItem("adminToken")

           },

            body: JSON.stringify({

              date: date,

              status: "店休日"

            })

          }

        );

    }

    // =========================
    // 店休日 → 削除（営業日に戻す）
    // =========================
    else {

      response =
        await fetch(

          API_URL +
          "/api/store-business-calendar",

          {

            method: "DELETE",

            headers: {

              "Content-Type":
                "application/json",

              "Authorization":
                "Bearer " +
              localStorage.getItem("adminToken")

          },

            body: JSON.stringify({

              date: date

            })

          }

        );

    }

    if (!response.ok) {

      throw new Error(
        "保存失敗"
      );

    }

    const result =
      await response.json();

    if (!result.success) {

      alert(

        result.message ||

        "保存できませんでした"

      );

      return;

    }

    // =========================
    // 最新データ取得
    // =========================
    await loadBusinessCalendar();

  } catch (e) {

    console.error(e);

    alert("通信エラー");

  } finally {

    businessLoading = false;

  }

}

// =========================
// Enterキーで今日へ戻る
// =========================
document.addEventListener(

  "keydown",

  (event) => {

    if (event.key !== "Enter") {

      return;

    }

    const active =

      document.activeElement;

    if (

      active &&

      active.tagName === "BODY"

    ) {

      goTodayBusiness();

    }

  }

);

// =========================
// ブラウザ復帰時に最新取得
// =========================
window.addEventListener(

  "focus",

  async () => {

    if (businessLoading) {

      return;

    }

    await refreshBusinessCalendar();

  }

);

// =========================
// デバッグ用
// =========================
function getBusinessCalendarData() {

  return businessCalendarData;

}

// =========================
// 初期表示を今月に固定
// =========================
function initBusinessCalendar() {

  businessCurrentMonth =
    new Date();

  renderBusinessCalendar();

}

// =========================
// 終了
// =========================