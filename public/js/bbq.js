let calendarData = [];
let currentMonth = new Date();

// =========================
// 予約状態
// =========================
const saved = localStorage.getItem('bbqReservation');

let reservation = saved
  ? JSON.parse(saved)
  : {
      productId: null,
      productName: null,
      price: null,
      date: null
    };

// =========================
// BBQ商品取得
// =========================
async function loadBbq() {

  const response =
    await fetch(API_URL + "/api/products");

  const products =
    await response.json();

  const bbqProducts =
    products.filter(
      p => p.type === "bbq"
    );

  const target =
    document.getElementById(
      "bbqProducts"
    );

  if(!target){

    return;

  }

  target.innerHTML = "";

  bbqProducts.forEach(product=>{

    target.innerHTML += `

      <div class="product-card">

        <img
          src="${product.image}"
          alt="${product.name}"
        >

        <div class="product-content">

          <h3>

            ${product.name}

          </h3>

          <p>

            ${product.description || ""}

          </p>

          <div class="price">

            ¥${Number(product.price).toLocaleString()}

          </div>

        </div>

      </div>

    `;

  });

  // =========================
  // BBQ商品が1つなら自動選択
  // =========================
  if(bbqProducts.length === 1){

    const product =
      bbqProducts[0];

    reservation.productId =
      Number(product.id);

    reservation.productName =
      product.name;

    reservation.price =
      Number(product.price);

    saveReservation();

    updateGoButton();

  }

}

// =========================
// BBQ選択
// =========================
function handleSelectBbq(button) {
  const id = Number(button.dataset.id);
  const name = button.dataset.name;
  const price = Number(button.dataset.price);

  selectBbq(id, name, price);
}

function selectBbq(id, name, price) {

  reservation.productId = id;
  reservation.productName = name;
  reservation.price = price;

  saveReservation();
  updateGoButton();

  document
    .getElementById('calendarSection')
    ?.scrollIntoView({ behavior: 'smooth' });
}

// =========================
// カレンダー取得
// =========================
async function loadCalendar() {

  const response =
    await fetch(API_URL + "/api/business-calendar");

  calendarData = await response.json();

  renderCalendar();
}

// =========================
// カレンダー描画
// =========================
function renderCalendar(){

  const target =
    document.getElementById("calendar");

  if(!target) return;

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(year,month,1);

  const lastDay =
    new Date(year,month+1,0);

  const startDay =
    firstDay.getDay();

  const totalDays =
    lastDay.getDate();

  let html = `

    <div class="bbq-calendar-header">

      <button onclick="prevMonth()">←</button>

      <h3>
        ${year}年 ${month+1}月
      </h3>

      <button onclick="nextMonth()">→</button>

    </div>

    <div class="bbq-week">

      <div>日</div>
      <div>月</div>
      <div>火</div>
      <div>水</div>
      <div>木</div>
      <div>金</div>
      <div>土</div>

    </div>

    <div class="bbq-calendar-grid">

  `;

  // 空白
  for(let i=0;i<startDay;i++){

    html += `<div></div>`;

  }

  // 今日
  const today = new Date();

  today.setHours(0,0,0,0);

  const todayStr =
    formatDate(today);

  for(let day=1; day<=totalDays; day++){

    const dateObj =
      new Date(year,month,day);

    const dateStr =
      formatDate(dateObj);

    const item =
      calendarData.find(
        d => d.date === dateStr
      );

    let className = "bbq-day";

    let status = "";

    let disabled = "";

    // =========================
    // 過去日は終了
    // =========================
    if(dateStr < todayStr){

      className += " full";

      status = "終了";

      disabled = "disabled";

    }

    // =========================
    // 営業中
    // =========================
    else if(
      item &&
      item.status === "○" &&
      Number(item.limit) > 0
    ){

      const limit =
        Number(item.limit);

      className +=
        limit <= 2
        ? " few"
        : " available";

      status =
        `あと${limit}枠`;

    }

    // =========================
    // 満席・休業
    // =========================
    else{

      className += " full";

      status = "満席";

      disabled = "disabled";

    }

    if(reservation.date === dateStr){

      className += " selected";

    }

    html += `

      <button

        class="${className}"

        ${disabled}

        onclick="selectDate('${dateStr}',this)"

      >

        <div class="date">

          ${day}

        </div>

        <div class="status">

          ${status}

        </div>

      </button>

    `;

  }

  html += `

    </div>

  `;

  target.innerHTML = html;

}

// =========================
// 日付選択
// =========================
function selectDate(date, button){

  const item =
    calendarData.find(
      d => d.date === date
    );

  if(!item){
    return;
  }

  if(item.status !== "○"){
    alert("この日は予約できません");
    return;
  }

  if(Number(item.limit) <= 0){
    alert("この日は満席です");
    return;
  }

  reservation.date = date;

  saveReservation();

  updateGoButton();

    document
    .querySelectorAll(".bbq-day")
    .forEach(btn =>
      btn.classList.remove("selected")
    );

  button.classList.add("selected");


  // 選択日表示

  const info =
    document.getElementById("selectedDateInfo");

  if(info){

    info.innerHTML =
      `
      選択日：
      <strong>${date}</strong>
      `;

  }

}

// =========================
// 月移動
// =========================
function prevMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
}

// =========================
// 日付フォーマット
// =========================
function formatDate(date) {

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

// =========================
// 保存
// =========================
function saveReservation() {

  localStorage.setItem(
    'bbqReservation',
    JSON.stringify(reservation)
  );
}

// =========================
// ボタン制御
// =========================
function updateGoButton() {

  const goBtn = document.getElementById('goOrder');

  if (!goBtn) return;

  goBtn.disabled = !(reservation.productId && reservation.date);
}

// =========================
// 次へ
// =========================
// =========================
// 次へ
// =========================
function goOrder() {

  if(!reservation.productId){

    alert("商品情報を取得できませんでした。");

    return;

  }

  if(!reservation.date){

    alert("予約日を選択してください");

    return;

  }

  if(location.pathname.includes("staff-bbq.html")){

    location.href = "staff-bbq-order.html";

  }else{

    location.href = "bbq-order.html";

  }

}

// =========================
// 初期化
// =========================
loadBbq();
loadCalendar();
