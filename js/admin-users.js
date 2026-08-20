// =========================
// 管理者管理
// =========================

let adminUsers = [];

// =========================
// トークン取得
// =========================
function getToken(){

  return localStorage.getItem(
    "adminToken"
  );

}

// =========================
// ログインユーザー取得
// =========================
function getLoginUser(){

  const text =
    localStorage.getItem(
      "adminUser"
    );

  if(!text){

    return null;

  }

  try{

    return JSON.parse(text);

  }catch(error){

    return null;

  }

}

// =========================
// 認証ヘッダー
// =========================
function authHeaders(){

  return {

    "Authorization":
      "Bearer " + getToken(),

    "Content-Type":
      "application/json"

  };

}

// =========================
// 初期化
// =========================
window.onload = async function(){

  const user =
    getLoginUser();

  if(!user){

    location.href =
      "admin-login.html";

    return;

  }

  if(user.role !== "owner"){

    alert(
      "この画面を利用する権限がありません。"
    );

    location.href =
      "admin.html";

    return;

  }

  const loginUser =
    document.getElementById(
      "loginUser"
    );

  if(loginUser){

    loginUser.textContent =
      `${user.name} (${user.id})`;

  }

  await loadUsers();

};

// =========================
// 管理者一覧取得
// =========================
async function loadUsers(){

  try{

    const response =
      await fetch(

        API_URL +
        "/api/admin/users",

        {

          headers:
            authHeaders()

        }

      );

    if(response.status === 401){

      alert(
        "ログインし直してください。"
      );

      logout();

      return;

    }

    const result =
      await response.json();

    if(!result.success){

      alert(
        result.message
      );

      return;

    }

    adminUsers =
      result.users;

    renderUsers();

  }catch(error){

    console.error(error);

    alert(
      "管理者一覧の取得に失敗しました。"
    );

  }

}

// =========================
// 一覧表示
// =========================
function renderUsers(){

  let html = "";

  adminUsers.forEach(user=>{

    html += `

<tr>

<td>${user.id}</td>

<td>${user.name}</td>

<td>${user.role}</td>

<td>

${user.enabled ? "有効" : "無効"}

</td>

<td>

<button
onclick="editUser('${user.id}')">

編集

</button>

${
user.role !== "owner"

?

`

<button
onclick="deleteUser('${user.id}')">

削除

</button>

`

:

""

}

</td>

</tr>

`;

  });

  document.getElementById(
    "userList"
  ).innerHTML =
    html;

}

// =========================
// 登録・更新
// =========================
async function saveUser(){

  const editId =
    document.getElementById(
      "editId"
    ).value;

  const id =
    document.getElementById(
      "id"
    ).value.trim();

  const name =
    document.getElementById(
      "name"
    ).value.trim();

  const password =
    document.getElementById(
      "password"
    ).value;

  const role =
    document.getElementById(
      "role"
    ).value;

  const enabled =
    document.getElementById(
      "enabled"
    ).checked;

  if(!id){

    alert(
      "ログインIDを入力してください。"
    );

    return;

  }

  if(!name){

    alert(
      "表示名を入力してください。"
    );

    return;

  }

  if(!editId && !password){

    alert(
      "パスワードを入力してください。"
    );

    return;

  }

  const url =

    editId

    ? "/api/admin/user/update"

    : "/api/admin/user/add";

  try{

    const response =
  await fetch(
    API_URL + url,
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

      body:JSON.stringify({

        id,

        name,

        password,

        role,

        enabled

      })

    }
  );

    if(response.status===401){

      logout();

      return;

    }

    const result =
      await response.json();

    if(!result.success){

      alert(
        result.message
      );

      return;

    }

    alert(

      editId

      ? "更新しました"

      : "登録しました"

    );

    cancelEdit();

    await loadUsers();

  }catch(error){

    console.error(error);

    alert(
      "保存に失敗しました。"
    );

  }

}


// =========================
// 編集
// =========================
function editUser(id){

  const user =

    adminUsers.find(

      item =>

        item.id===id

    );

  if(!user){

    return;

  }

  document.getElementById(

    "formTitle"

  ).textContent =

    "管理者編集";

  document.getElementById(

    "saveBtn"

  ).textContent =

    "保存";

  document.getElementById(

    "cancelBtn"

  ).style.display =

    "block";

  document.getElementById(

    "editId"

  ).value =

    user.id;

  document.getElementById(

    "id"

  ).value =

    user.id;

  document.getElementById(

    "id"

  ).disabled =

    true;

  document.getElementById(

    "name"

  ).value =

    user.name;

  document.getElementById(

    "password"

  ).value =

    "";

  document.getElementById(

    "role"

  ).value =

    user.role;

  document.getElementById(

    "enabled"

  ).checked =

    user.enabled;

}


// =========================
// 編集キャンセル
// =========================
function cancelEdit(){

  document.getElementById(

    "formTitle"

  ).textContent =

    "管理者追加";

  document.getElementById(

    "saveBtn"

  ).textContent =

    "登録";

  document.getElementById(

    "cancelBtn"

  ).style.display =

    "none";

  document.getElementById(

    "editId"

  ).value =

    "";

  document.getElementById(

    "id"

  ).disabled =

    false;

  document.getElementById(

    "id"

  ).value =

    "";

  document.getElementById(

    "name"

  ).value =

    "";

  document.getElementById(

    "password"

  ).value =

    "";

  document.getElementById(

    "role"

  ).value =

    "staff";

  document.getElementById(

    "enabled"

  ).checked =

    true;

}

// =========================
// 管理者削除
// =========================
async function deleteUser(id){

  if(
    !confirm(
      id + " を削除しますか？"
    )
  ){

    return;

  }

  try{

    const response =
      await fetch(

        API_URL +
        "/api/admin/user/delete",

        {

          method:"POST",

          headers:
            authHeaders(),

          body:
            JSON.stringify({

              id

            })

        }

      );

    if(response.status===401){

      logout();

      return;

    }

    const result =
      await response.json();

    if(!result.success){

      alert(
        result.message
      );

      return;

    }

    alert(
      "削除しました。"
    );

    await loadUsers();

  }catch(error){

    console.error(error);

    alert(
      "削除に失敗しました。"
    );

  }

}


// =========================
// ログアウト
// =========================
function logout(){

  localStorage.removeItem(
    "adminToken"
  );

  localStorage.removeItem(
    "adminUser"
  );

  location.href =
    "admin-login.html";

}
