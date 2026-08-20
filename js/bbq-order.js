// =========================
// BBQ予約画面 初期表示
// =========================
function displayOrder() {

  const saved =
    localStorage.getItem('bbqReservation');

  const isStaff =
    location.pathname.includes("staff-bbq-order.html");

  const backPage =
    isStaff
    ? "staff-bbq.html"
    : "bbq.html";


  if (!saved) {

    alert('予約情報が見つかりません。最初からやり直してください。');

    location.href = backPage;

    return;

  }


  const data =
    JSON.parse(saved);


  const target =
    document.getElementById('orderItems');


  if (target) {

    target.innerHTML = `

      <div class="product-card">

        <div class="product-content">

          <h2>
            ${data.productName || ''}
          </h2>

          <p>
            予約日：${data.date || ''}
          </p>

          <div class="price">
            ¥${Number(data.price || 0).toLocaleString()}
          </div>

        </div>

      </div>

    `;

  }


  const peopleInput =
    document.getElementById('people');


  if (
    peopleInput &&
    !peopleInput.value
  ) {

    peopleInput.value = 1;

  }

}



// =========================
// BBQ予約送信処理
// =========================
async function sendBbqOrder() {


  if(window.sending) return;


  window.sending = true;


  const btn =
    document.querySelector('.order-btn');


  if(btn){

    btn.disabled = true;

  }


  try{


    const customerName =
      document
      .getElementById('customerName')
      .value
      .trim();


    const customerTel =
      document
      .getElementById('customerTel')
      .value
      .trim();


    const people =
      Number(
        document
        .getElementById('people')
        .value
      );


    const memo =
      document
      .getElementById('memo')
      .value
      .trim();




    const saved =
      localStorage.getItem('bbqReservation');


    const isStaff =
      location.pathname.includes("staff-bbq-order.html");


    const backPage =
      isStaff
      ? "staff-bbq.html"
      : "bbq.html";



    if(!saved){

      alert('予約情報がありません');

      location.href = backPage;

      return;

    }



    const data =
      JSON.parse(saved);




    if(
      !data.productName ||
      !data.date
    ){

      alert('予約情報が不正です');

      return;

    }



    if(!customerName){

      alert('お名前を入力してください');

      return;

    }



    if(!customerTel){

      alert('電話番号を入力してください');

      return;

    }



    if(!people || people <= 0){

      alert('人数を正しく入力してください');

      return;

    }



    const telPattern =
      /^[0-9\-]+$/;


    if(!telPattern.test(customerTel)){


      alert(
        '電話番号を正しく入力してください'
      );


      return;

    }





    const orderData = {


      orderType:
        'BBQ',


      useDate:
        data.date,


      plan:
        data.productName,


      unitPrice:
        Number(data.price || 0),


      people,


      customerName,


      customerTel,


      memo


    };






    const response =

      await fetch(

        API_URL +
        '/api/reservations',

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(orderData)

        }

      );





    const result =
      await response.json();





    if(result.success){


      localStorage.removeItem(
        "bbqReservation"
      );



      alert(

        '予約完了しました\n予約番号：' +

        (result.reservationNo || '')

      );




      location.href =

        isStaff

        ? "staff.html"

        : "index.html";




    }else{


      alert(

        result.message ||
        '送信エラー'

      );


    }




  }catch(error){


    console.error(error);


    alert(
      '通信エラーが発生しました'
    );


  }finally{


    window.sending = false;


    if(btn){

      btn.disabled = false;

    }


  }

}



// =========================
// 初期表示実行
// =========================
displayOrder();
