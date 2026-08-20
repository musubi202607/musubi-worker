// =========================
// 初期表示
// =========================
window.addEventListener(
  "DOMContentLoaded",
  ()=>{

    loadKitchenUnpaid();

  }
);



// =========================
// 未会計取得
// =========================
async function loadKitchenUnpaid(){

  try{


    const res =
      await fetch(

        API_URL +
        "/api/kitchen/unpaid"

      );



    const data =
      await res.json();



    displayUnpaid(data);



  }catch(error){


    console.error(

      "未会計取得エラー",

      error

    );

  }

}




// =========================
// 表示
// =========================
function displayUnpaid(data){


  const area =
    document.getElementById(
      "unpaidList"
    );


  area.innerHTML = "";



  if(
    !data ||
    data.length === 0
  ){


    area.innerHTML = `

<div class="shop-info-card">

<h2>

未会計注文はありません

</h2>

</div>

`;


    return;

  }



  data.forEach(order=>{


    area.innerHTML += `


<div class="shop-info-card">


<h2>

${order.orderNo}

</h2>


<p>

車両：
${order.carNumber}

</p>


<p>

${order.items}

</p>


<h3>

合計：

¥${Number(order.total).toLocaleString()}

</h3>



<button

onclick="
setKitchenPaid('${order.orderNo}')
"

>

会計済にする

</button>


</div>


`;

  });


}



// =========================
// 会計済変更
// =========================
async function setKitchenPaid(orderNo){


  const res =
    await fetch(

      API_URL +
      "/api/kitchen/paid",

      {

        method:"POST",

        headers:{

          "Content-Type":
          "application/json"

        },


        body:

        JSON.stringify({

          orderNo

        })

      }

    );



  const result =
    await res.json();



  if(result.success){


    alert(
      "会計済に変更しました"
    );


    loadKitchenUnpaid();



  }else{


    alert(

      result.message ||

      "更新失敗"

    );

  }


}
