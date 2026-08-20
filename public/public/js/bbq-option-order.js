// =========================
// BBQ追加注文送信
// =========================
async function sendBbqOptionOrder(){

  console.log(
    "sendBbqOptionOrder START"
  );


  // =========================
  // 予約確認
  // =========================
  if(!currentReservation){

    alert(
      "予約を選択してください"
    );

    return;

  }


  // =========================
  // 商品確認
  // =========================
  if(bbqCart.length === 0){

    alert(
      "商品を追加してください"
    );

    return;

  }


  try{


    const body = {

      reservationNo:
        currentReservation.reservationNo,

      useDate:
        currentReservation.useDate,

      customerName:
        currentReservation.customerName,

      memo:
        "",

      items:
        bbqCart

    };


    console.log(
      "送信データ",
      body
    );


    const response =
      await fetch(

        API_URL +
        "/api/bbq/addOrder",

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(body)

        }

      );


    console.log(
      "status=",
      response.status
    );


    const result =
      await response.json();


    console.log(
      "result=",
      result
    );


    if(result.success){


      alert(
        "追加注文を受け付けました"
      );


      bbqCart = [];


      renderCart();


    }else{


      alert(

        result.message ||
        "送信エラー"

      );


    }


  }
  catch(error){


    console.error(
      "追加注文エラー",
      error
    );


    alert(
      "通信エラー"
    );


  }


}
