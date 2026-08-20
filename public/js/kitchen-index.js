// =========================
// 未会計件数取得
// =========================
window.addEventListener(

"DOMContentLoaded",

()=>{

loadKitchenUnpaidCount();

}

);




// =========================
// 件数表示
// =========================
async function loadKitchenUnpaidCount(){


try{


const res =

await fetch(

API_URL +
"/api/kitchen/unpaid",

{

headers:{

Authorization:

"Bearer " +

localStorage.getItem(
"adminToken"
)

}

}

);



const data =

await res.json();



const count =

Array.isArray(data)

?

data.length

:

0;



const area =

document.getElementById(

"unpaidCount"

);



if(area){


if(count > 0){


area.innerText =

"未会計 " +
count +
"件";


}else{


area.innerText =

"未会計なし";


}


}



}catch(e){


console.error(

"未会計件数取得エラー",

e

);



const area =

document.getElementById(

"unpaidCount"

);



if(area){

area.innerText =
"確認不可";

}



}


}
