// =========================
// 初期日付
// =========================
window.addEventListener(

"DOMContentLoaded",

()=>{


const today =
new Date();


const date =
today.toISOString()
.split("T")[0];


document.getElementById(
"startDate"
).value =
date;


document.getElementById(
"endDate"
).value =
date;


loadKitchenSales();


}

);




// =========================
// 売上取得
// =========================
async function loadKitchenSales(){


const startDate =
document.getElementById(
"startDate"
).value;


const endDate =
document.getElementById(
"endDate"
).value;



const res =
await fetch(

API_URL +
"/api/kitchen/sales",

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

JSON.stringify({

startDate,

endDate

})

}

);



const data =
await res.json();



document.getElementById(
"totalSales"
).innerText =

"¥" +

Number(
data.totalSales || 0
)
.toLocaleString();



const area =
document.getElementById(
"productSales"
);


area.innerHTML="";



(data.products || [])
.forEach(item=>{


area.innerHTML += `

<p>

${item.name}

<br>

数量：
${item.qty}

個

<br>

売上：
¥${Number(item.amount).toLocaleString()}

</p>

<hr>

`;

});


}
