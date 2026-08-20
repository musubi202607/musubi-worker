// =========================
// 初期化
// =========================
window.onload = function(){

  initShopImages();

  loadShopSettings();

};



// =========================
// 店舗情報取得
// =========================
async function loadShopSettings(){

  try{


    const token =
      localStorage.getItem("adminToken");



    const response =
      await fetch(

        API_URL +
        "/api/shop-settings",

        {

          headers:{

            "Authorization":
              "Bearer " + token

          }

        }

      );



    const data =
      await response.json();




    const keys = [

      "shopName",

      "phone",

      "address",

      "businessHours",

      "holidayList",

      "instagram",

      "line",

      "googleMap",

      "notice1",

      "notice2",

      "notice3",

      "topImage",

      "shopImage1",

      "shopImage2",

      "shopImage3"

    ];




    keys.forEach(key=>{


      const element =
        document.getElementById(key);



      if(element){


        element.value =
          data[key] || "";


      }


    });




    updatePreview("topImage");

    updatePreview("shopImage1");

    updatePreview("shopImage2");

    updatePreview("shopImage3");



  }catch(error){


    console.error(error);


    alert(

      "店舗情報の取得に失敗しました"

    );


  }


}






// =========================
// プレビュー更新
// =========================
function updatePreview(id){


  const input =
    document.getElementById(id);



  const preview =
    document.getElementById(
      id + "Preview"
    );



  if(
    !input ||
    !preview
  ){

    return;

  }



  if(input.value){


    preview.src =
      input.value;



    preview.style.display =
      "block";



  }else{


    preview.src = "";

    preview.style.display =
      "none";


  }


}






// =========================
// 画像アップロード初期化
// =========================
function initShopImages(){


  const imageIds = [


    "topImage",

    "shopImage1",

    "shopImage2",

    "shopImage3"


  ];




  imageIds.forEach(id=>{


    const input =
      document.getElementById(id);



    const fileInput =
      document.getElementById(
        id + "File"
      );



    if(input){


      input.addEventListener(

        "input",

        ()=>{


          updatePreview(id);


        }

      );


    }



    if(fileInput){


      fileInput.addEventListener(

        "change",

        async ()=>{


          try{


            await uploadImage({

              fileInputId:
                id + "File",


              urlInputId:
                id,


              previewId:
                id + "Preview"


            });



          }catch(error){


            console.error(error);



            alert(

              "画像アップロード失敗"

            );


          }


        }

      );


    }


  });


}

// =========================
// 店舗情報保存
// =========================
async function saveShopSettings(){


  const body = {


    shopName:
      document.getElementById(
        "shopName"
      ).value,


    phone:
      document.getElementById(
        "phone"
      ).value,


    address:
      document.getElementById(
        "address"
      ).value,


    businessHours:
      document.getElementById(
        "businessHours"
      ).value,


    holidayList:
      document.getElementById(
        "holidayList"
      ).value,



    instagram:
      document.getElementById(
        "instagram"
      ).value,


    line:
      document.getElementById(
        "line"
      ).value,


    googleMap:
      document.getElementById(
        "googleMap"
      ).value,



    // =========================
    // お知らせ Ver2.0追加
    // =========================

    notice1:
      document.getElementById(
        "notice1"
      ).value,


    notice2:
      document.getElementById(
        "notice2"
      ).value,


    notice3:
      document.getElementById(
        "notice3"
      ).value,



    // =========================
    // 画像
    // =========================

    topImage:
      document.getElementById(
        "topImage"
      ).value,


    shopImage1:
      document.getElementById(
        "shopImage1"
      ).value,


    shopImage2:
      document.getElementById(
        "shopImage2"
      ).value,


    shopImage3:
      document.getElementById(
        "shopImage3"
      ).value


  };




  try{


    const response =
      await fetch(


        API_URL +
        "/api/shop-settings",


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
            JSON.stringify(body)


        }


      );





    const result =
      await response.json();





    if(result.success){


      alert(

        "店舗情報を保存しました"

      );



    }else{


      alert(


        result.message ||


        "保存に失敗しました"



      );


    }



  }catch(error){



    console.error(error);



    alert(

      "通信エラーが発生しました"

    );



  }


}

// =========================
// 初期化
// =========================
window.onload = function(){

  initShopImages();

  loadShopSettings();

};


// =========================
// 店舗情報取得
// =========================
async function loadShopSettings(){

  try{

    const token =
  localStorage.getItem("adminToken");

const response =
  await fetch(

    API_URL +
    "/api/shop-settings",

    {
      headers:{
        "Authorization":
          "Bearer " + token
      }
    }

  );

    const data =
      await response.json();

    const keys = [

      "shopName",

      "phone",

      "address",

      "businessHours",

      "holidayList",

      "topImage",

      "shopImage1",

      "shopImage2",

      "shopImage3",

      "instagram",

      "line",

      "googleMap",

      "notice1",

      "notice2",

      "notice3"

    ];

    keys.forEach(key=>{

      const element =
        document.getElementById(key);

      if(element){

        element.value =
          data[key] || "";

      }

    });

    updatePreview("topImage");

    updatePreview("shopImage1");

    updatePreview("shopImage2");

    updatePreview("shopImage3");

  }catch(error){

    console.error(error);

    alert(
      "店舗情報の取得に失敗しました"
    );

  }

}

// =========================
// プレビュー更新
// =========================
function updatePreview(id){

  const input =
    document.getElementById(id);

  const preview =
    document.getElementById(
      id + "Preview"
    );

  if(
    !input ||
    !preview
  ){

    return;

  }

  if(input.value){

    preview.src =
      input.value;

    preview.style.display =
      "block";

  }else{

    preview.src = "";

    preview.style.display =
      "none";

  }

}


// =========================
// 画像アップロード初期化
// =========================
function initShopImages(){

  const imageIds = [

    "topImage",

    "shopImage1",

    "shopImage2",

    "shopImage3"

  ];

  imageIds.forEach(id=>{

    // -------------------------
    // URL変更時プレビュー更新
    // -------------------------
    document
      .getElementById(id)
      .addEventListener(

        "input",

        ()=>{

          updatePreview(id);

        }

      );

    // -------------------------
    // ファイル選択
    // -------------------------
    document
      .getElementById(
        id + "File"
      )
      .addEventListener(

        "change",

        async ()=>{

          try{

            await uploadImage({

              fileInputId:
                id + "File",

              urlInputId:
                id,

              previewId:
                id + "Preview"

            });

          }catch(error){

            console.error(error);

            alert(
              "画像アップロード失敗"
            );

          }

        }

      );

  });

}

// =========================
// 店舗情報保存
// =========================
async function saveShopSettings(){

  const body = {

    shopName:
      document.getElementById(
        "shopName"
      ).value,

    phone:
      document.getElementById(
        "phone"
      ).value,

    address:
      document.getElementById(
        "address"
      ).value,

    businessHours:
      document.getElementById(
        "businessHours"
      ).value,

    holidayList:
      document.getElementById(
        "holidayList"
      ).value,

    topImage:
      document.getElementById(
        "topImage"
      ).value,

    shopImage1:
      document.getElementById(
        "shopImage1"
      ).value,

    shopImage2:
      document.getElementById(
        "shopImage2"
      ).value,

    shopImage3:
      document.getElementById(
        "shopImage3"
      ).value,

    instagram:
      document.getElementById(
        "instagram"
      ).value,

    line:
      document.getElementById(
        "line"
      ).value,

    googleMap:
      document.getElementById(
        "googleMap"
      ).value,

    notice1:
     document.getElementById(
       "notice1"
      ).value,

    notice2:
      document.getElementById(
        "notice2"
      ).value,

    notice3:
      document.getElementById(
        "notice3"
      ).value

  };

  try{

    const response =
      await fetch(

        API_URL +
        "/api/shop-settings",

        {

          method:"POST",

          headers:{

  "Content-Type":
    "application/json",

  "Authorization":
    "Bearer " +
    localStorage.getItem("adminToken")

},

          body:
            JSON.stringify(body)

        }

      );

    const result =
      await response.json();

    if(result.success){

      alert(
        "保存しました"
      );

    }else{

      alert(

        result.message ||

        "保存失敗"

      );

    }

  }catch(error){

    console.error(error);

    alert(
      "通信エラー"
    );

  }

}
