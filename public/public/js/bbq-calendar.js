// =========================
// BBQカレンダー管理
// =========================

const MONTHS_TO_SHOW = 2;

// 表示月
let currentMonth = new Date();

// 店休日
let holidayData = [];

// BBQ例外
let bbqExceptionData = [];

// 描画用
let calendarData = [];

// 選択日
let selectedDate = "";

// =========================
// 初期化
// =========================
window.onload = async function(){

  await loadHolidayCalendar();

  await loadBbqExceptionCalendar();

  buildCalendar();

};

// =========================
// 店休日取得
// =========================
async function loadHolidayCalendar(){

  try{

    const res =
  await fetch(
    API_URL +
    "/api/store-business-calendar",
    {
      headers:{
        Authorization:
          "Bearer " +
          localStorage.getItem("adminToken")
      }
    }
  );

    holidayData =
      await res.json();

    if(!Array.isArray(holidayData)){

      holidayData = [];

    }

  }catch(e){

    console.error(e);

    holidayData = [];

  }

}

// =========================
// BBQ例外取得
// =========================
async function loadBbqExceptionCalendar(){

  try{

    const res =
  await fetch(
    API_URL +
    "/api/business-calendar",
    {
      headers:{
        Authorization:
          "Bearer " +
          localStorage.getItem("adminToken")
      }
    }
  );

    if(!res.ok){

      throw new Error(
        "BBQ例外取得失敗"
      );

    }

    const data =
      await res.json();

    if(!Array.isArray(data)){

      bbqExceptionData = [];

      return;

    }

    bbqExceptionData =
      data.map(item=>({

        date:
          item.date,

        status:
          item.status || "×",

        limit:
          Number(item.limit) || 0

      }));

  }catch(e){

    console.error(
      "BBQ例外取得エラー",
      e
    );

    bbqExceptionData = [];

  }

}

// =========================
// 日付文字列
// =========================
function formatDate(date){

  const y =
    date.getFullYear();

  const m =
    String(
      date.getMonth()+1
    ).padStart(2,"0");

  const d =
    String(
      date.getDate()
    ).padStart(2,"0");

  return `${y}-${m}-${d}`;

}

// =========================
// 曜日
// =========================
const WEEK_NAME = [

  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土"

];

// =========================
// カレンダーデータ生成
// =========================
function buildCalendar(){

  calendarData = [];


  // 表示月の月初から開始

  const start =
    new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );


  start.setHours(
    0,0,0,0
  );



  // 2ヶ月先まで

  const end =
    new Date(start);


  end.setMonth(
    end.getMonth() +
    MONTHS_TO_SHOW
  );



  for(

    let d =
      new Date(start);

    d <= end;

    d.setDate(
      d.getDate()+1
    )

  ){


    const date =
      formatDate(d);



    const week =
      d.getDay();



    // =========================
    // デフォルト設定
    // =========================

    let status =
      (week===0 || week===6)
      ? "○"
      : "×";


    let limit =
      (week===0 || week===6)
      ? 1
      : 0;



    let isHoliday =
      false;


    let isException =
      false;



    // =========================
    // 店休日判定
    // =========================

    const holiday =
      holidayData.find(
        row =>
          row.date === date
      );



    if(
      holiday &&
      holiday.status === "店休日"
    ){

      status =
        "×";


      limit =
        0;


      isHoliday =
        true;

    }



    // =========================
    // BBQ例外判定
    // =========================

    const exception =
      bbqExceptionData.find(
        row =>
          row.date === date
      );



    if(

      exception &&

      !isHoliday

    ){


      status =
        exception.status;


      limit =
  exception.status === "×"
    ? 0
    : Number(exception.limit);

      isException =
        true;


    }



    calendarData.push({

      date,

      status,

      limit,

      week,

      isHoliday,

      isException

    });



  }



  renderCalendar();


}

// =========================
// デフォルト設定取得
// =========================
function getDefaultSetting(date){

  const d =
    new Date(date);

  const week =
    d.getDay();

  // 土日
  if(
    week===0 ||
    week===6
  ){

    return{

      status:"○",

      limit:1,

      text:
        "通常設定：土日のため予約可（1組）"

    };

  }

  // 平日
  return{

    status:"×",

    limit:0,

    text:
      "通常設定：平日のため予約不可"

  };

}

// =========================
// カレンダー描画
// =========================
function renderCalendar(){

  const body =
    document.getElementById(
      "calendarBody"
    );


  body.innerHTML = "";


  // 曜日
  const weeks = [
    "日","月","火","水","木","金","土"
  ];


  weeks.forEach(day=>{

    body.innerHTML +=
      `<div class="bbq-week">${day}</div>`;

  });



  const year =
    currentMonth.getFullYear();


  const month =
    currentMonth.getMonth();



  document.getElementById(
    "monthTitle"
  ).textContent =
    `${year}年${month+1}月`;



  // 月初
  const firstDay =
    new Date(
      year,
      month,
      1
    );


  // 日曜始まり調整

  let blank =
    firstDay.getDay();

  // 空白セル

  for(
    let i=0;
    i<blank;
    i++
  ){

    body.innerHTML +=
      `
      <div class="bbq-cell bbq-empty"></div>
      `;

  }



  // 今日

  const todayDate =
    formatDate(
      new Date()
    );



  // 表示対象

  const list =
    calendarData.filter(item=>{


      const d =
        new Date(item.date);



      return(

        d.getFullYear()===year &&

        d.getMonth()===month

      );


    });



  // 日付セル

  list.forEach(item=>{


    const d =
      new Date(item.date);



    // 過去日判定

    const isPast =
      item.date < todayDate;



    let badge =
      item.status==="○"
      ? "bbq-open"
      : "bbq-close";



    let icon="";



    if(item.isHoliday){

      icon="🏠";

    }
    else if(item.isException){

      icon="★";

    }



    body.innerHTML += `


<div
class="bbq-cell
${todayDate===item.date ? " bbq-today" : ""}"
${isPast ? "" : `onclick="openModal('${item.date}')"`}

>


${isPast ? "" : `


<div class="bbq-date">

${d.getDate()}

</div>


<div>

<span class="${badge}">

${item.status==="○"
?"予約可"
:"予約不可"}

</span>

</div>


<div class="bbq-limit">

${
  item.status === "○"
    ? `${item.limit}組`
    : ""
}

</div>

<div
style="margin-top:8px;font-size:18px;">

${icon}

</div>


`}


</div>


`;



  });



}

// =========================
// 前月
// =========================
function prevMonth(){


  const now =
    new Date();



  // 今日の月より前へ戻さない

  if(

    currentMonth.getFullYear() ===
    now.getFullYear()

    &&

    currentMonth.getMonth() ===
    now.getMonth()

  ){

    return;

  }



  currentMonth.setMonth(

    currentMonth.getMonth()-1

  );



  buildCalendar();


}



// =========================
// 次月
// =========================
function nextMonth(){


  currentMonth.setMonth(

    currentMonth.getMonth()+1

  );



  buildCalendar();


}

//ここから確認必//

// =========================
// モーダル表示
// =========================
function openModal(date){

  selectedDate = date;


  const item =
    calendarData.find(
      row =>
        row.date === date
    );


  if(!item){
    return;
  }


  const modal =
    document.getElementById(
      "editModal"
    );


  document.getElementById(
    "modalDate"
  ).textContent =
    date;



  // 通常設定

  const normal =
    getDefaultSetting(date);


  document.getElementById(
    "defaultInfo"
  ).innerHTML = `

<p>
状態：
${normal.status==="○"
?"予約可"
:"予約不可"}
</p>

<p>
最大組数：
${normal.limit}組
</p>

<p>
${normal.text}
</p>

`;



  // 現在設定

  document.getElementById(
    "modalStatus"
  ).value =
    item.status;


  document.getElementById(
  "modalLimit"
).value =
  item.isHoliday
    ? ""
    : item.limit;



  // 店休日ロック

  const lock =
    document.getElementById(
      "holidayMessage"
    );


  const editArea =
    document.getElementById(
      "editArea"
    );


  const save =
    document.getElementById(
      "saveModal"
    );


  if(item.isHoliday){


    lock.style.display =
      "block";


    editArea.style.opacity =
      "0.5";


    document.getElementById(
      "modalStatus"
    ).disabled =
      true;


    document.getElementById(
      "modalLimit"
    ).disabled =
      true;


    save.disabled =
      true;


  }else{


    lock.style.display =
      "none";


    editArea.style.opacity =
      "1";


    document.getElementById(
      "modalStatus"
    ).disabled =
      false;


    document.getElementById(
      "modalLimit"
    ).disabled =
      false;


    save.disabled =
      false;


  }



  modal.style.display =
    "flex";


}



// =========================
// モーダル閉じる
// =========================
function closeCalendarModal(){

  document.getElementById(
    "editModal"
  ).style.display =
    "none";


  selectedDate = "";

}



// =========================
// BBQ例外保存
// =========================
async function saveBbqException(){


  if(!selectedDate){
    return;
  }


  const data = {

    date:
      selectedDate,


    status:
      document.getElementById(
        "modalStatus"
      ).value,


    limit:
      Number(
        document.getElementById(
          "modalLimit"
        ).value
      )

  };



  try{


    const res =
      await fetch(
        API_URL +
        "/api/business-calendar",
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
            JSON.stringify(data)

        }

      );


    const result =
      await res.json();



    if(result.success){


      await loadBbqExceptionCalendar();


      buildCalendar();


      closeCalendarModal();


    }else{


      alert(
        "保存できませんでした"
      );


    }



  }catch(e){


    console.error(e);


    alert(
      "通信エラー"
    );


  }


}



// =========================
// BBQ例外削除
// =========================
async function deleteBbqException(){


  if(!selectedDate){
    return;
  }



  if(
    !confirm(
      "この日の例外設定を削除しますか？"
    )
  ){

    return;

  }



  try{


    const res =
      await fetch(
        API_URL +
        "/api/business-calendar",
        {


          method:"DELETE",


         headers:{
  "Content-Type":
    "application/json",

  Authorization:
    "Bearer " +
    localStorage.getItem("adminToken")
},


          body:
            JSON.stringify({

              date:
                selectedDate

            })


        }

      );



    const result =
      await res.json();



      if(result.success){


    await loadBbqExceptionCalendar();


    buildCalendar();


    closeCalendarModal();


  }



  }catch(e){


    console.error(e);


  }


}



// =========================
// イベント登録
// =========================
document.addEventListener(
"DOMContentLoaded",
()=>{


  // 閉じる

  const close =
    document.getElementById(
      "closeModal"
    );


  if(close){

    close.onclick =
      closeCalendarModal;

  }



  // 保存

  const save =
    document.getElementById(
      "saveModal"
    );


  if(save){

    save.onclick =
      saveBbqException;

  }



  // 削除

  const del =
    document.getElementById(
      "deleteModal"
    );


  if(del){

    del.onclick =
      deleteBbqException;

  }



  // 月送り

  const prev =
    document.getElementById(
      "prevMonth"
    );


  if(prev){

    prev.onclick =
      prevMonth;

  }



  const next =
    document.getElementById(
      "nextMonth"
    );


  if(next){

    next.onclick =
      nextMonth;

  }



});
