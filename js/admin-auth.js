// =========================
// 管理画面認証チェック
// =========================

(async function(){


  const token =
    localStorage.getItem(
      "adminToken"
    );


  // =========================
  // トークンなし
  // =========================
  if(!token){


    localStorage.setItem(

      "loginRedirect",

      location.pathname

    );


    location.href =
      "admin-login.html";


    return;


  }



  try{


    const res =
      await fetch(

        API_URL +
        "/api/admin/verify",

        {

          headers:{

            Authorization:
              "Bearer " + token

          }

        }

      );



    // =========================
    // 認証失敗
    // =========================
    if(!res.ok){


      localStorage.removeItem(
        "adminToken"
      );


      localStorage.removeItem(
        "adminUser"
      );



      localStorage.setItem(

        "loginRedirect",

        location.pathname

      );



      location.href =
        "admin-login.html";



      return;


    }




    const result =
      await res.json();




    // =========================
    // ユーザー情報保存
    // =========================
    window.adminUser =
      result.user;




    localStorage.setItem(

      "adminUser",

      JSON.stringify(
        result.user
      )

    );



  }


  catch(e){


    console.error(e);



    localStorage.removeItem(
      "adminToken"
    );


    localStorage.removeItem(
      "adminUser"
    );



    localStorage.setItem(

      "loginRedirect",

      location.pathname

    );



    location.href =
      "admin-login.html";



  }


})();

// =========================
// 共通ログアウト
// =========================

async function logout(){

  const token =
    localStorage.getItem(
      "adminToken"
    );


  try{

    if(token){

      await fetch(

        API_URL +
        "/api/admin/logout",

        {

          method:"POST",

          headers:{

            Authorization:
            "Bearer " + token

          }

        }

      );

    }

  }catch(e){

    console.error(e);

  }


  localStorage.removeItem(
    "adminToken"
  );


  localStorage.removeItem(
    "adminUser"
  );


  localStorage.removeItem(
    "loginRedirect"
  );


  location.href =
    "admin-login.html";

}
