// =========================
// 売上取消
// =========================

let currentOrder = null;


// =========================
// 初期表示
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const now = new Date();

const today =
    new Date(
        now.getTime() -
        now.getTimezoneOffset() * 60000
    )
    .toISOString()
    .slice(0,10);
    document.getElementById("startDate").value =
        today;

    document.getElementById("endDate").value =
        today;

    loadOrders();

});


// =========================
// 一覧取得
// =========================
async function loadOrders(){

    const startDate =
        document.getElementById("startDate").value;

    const endDate =
        document.getElementById("endDate").value;

    const orderList =
        document.getElementById("orderList");

    orderList.innerHTML =
        "読込中...";


    try{

        const token =
            localStorage.getItem("adminToken");


        const res =
            await fetch(
                API_URL +
                "/api/sales/list",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " +
                            token
                    },

                    body:
                        JSON.stringify({

                            startDate:
                                startDate,

                            endDate:
                                endDate

                        })
                }
            );


        // =========================
        // HTTPエラー
        // =========================
        if(!res.ok){

            const errorText =
                await res.text();

            console.error(
                "Sales List Error:",
                res.status,
                errorText
            );

            orderList.innerHTML =
                "データ取得失敗<br>" +
                "HTTP " +
                res.status;

            return;

        }


        // =========================
        // JSON取得
        // =========================
        const data =
            await res.json();


        console.log(
            "Sales List Response:",
            data
        );


        // =========================
        // レスポンス形式対応
        // =========================
        let list = [];


        // 配列そのもの
        if(
            Array.isArray(data)
        ){

            list = data;

        }

        // { orders: [] }
        else if(
            Array.isArray(data.orders)
        ){

            list = data.orders;

        }

        // { data: [] }
        else if(
            Array.isArray(data.data)
        ){

            list = data.data;

        }


        // =========================
        // 不正レスポンス
        // =========================
        if(
            !Array.isArray(list)
        ){

            console.error(
                "Invalid sales list:",
                data
            );

            orderList.innerHTML =
                "データ取得失敗";

            return;

        }


        // =========================
        // データなし
        // =========================
        if(
            list.length === 0
        ){

            orderList.innerHTML =
                "対象データなし";

            return;

        }


        // =========================
        // 一覧HTML
        // =========================
        let html = "";


        list.forEach(item => {

            let icon =
                "🍙";


            if(
                item.type === "bbq"
            ){

                icon =
                    "🔥";

            }


            if(
                item.type === "kitchen"
            ){

                icon =
                    "🚚";

            }


            html += `

<div
    class="order-card"
    onclick="
        showDetail(
            '${item.type}',
            '${item.orderNo}'
        )
    "
>

    <div class="order-top">

        <div>

            <div class="order-no">

                ${icon}
                ${item.orderNo}

            </div>


            <div>

                ${
                    item.customerName ||
                    item.carNumber ||
                    ""
                }

            </div>

        </div>


        <div class="order-total">

            ¥${Number(
                item.total || 0
            ).toLocaleString()}

        </div>

    </div>


    <div class="order-paid">

        会計：
        ${item.payment || ""}

    </div>

</div>

`;

        });


        orderList.innerHTML =
            html;


    }
    catch(err){

        console.error(
            "Sales List Exception:",
            err
        );

        orderList.innerHTML =
            "通信エラー";

    }

}


// =========================
// 明細表示
// =========================
async function showDetail(
    type,
    no
){

    currentOrder = {

        type:
            type,

        no:
            no

    };


try{

    const res =
        await fetch(
            API_URL + "/api/sales/detail",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json",
                    "Authorization":
                        "Bearer " +
                        localStorage.getItem("adminToken")
                },

                body:JSON.stringify({

                    type:type,

                    orderNo:no

                })
            }
        );


        if(
            !res.ok
        ){

            const errorText =
                await res.text();

            console.error(
                "Detail Error:",
                res.status,
                errorText
            );

            throw new Error(
                "HTTP " +
                res.status
            );

        }


        const data =
            await res.json();


        console.log(
            "Order Detail:",
            data
        );


        let html = "";


        // =========================
        // 注文番号
        // =========================
        html += `

<p>

注文番号：
${no}

</p>

<hr>

`;


        // =========================
        // 商品明細
        // =========================
        if(
            Array.isArray(data.items)
        ){

            data.items.forEach(item => {

                html += `

<div class="detail-item">

    <span>

        ${item.name}

        ×${item.qty}

    </span>

    <span>

        ¥${Number(
            item.amount || 0
        ).toLocaleString()}

    </span>

</div>

`;

            });

        }


        // =========================
        // 合計
        // =========================
        html += `

<hr>

<h2>

合計

¥${Number(
    data.total || 0
).toLocaleString()}

</h2>

<p>

会計状態：
${data.payment || ""}

</p>

`;


        // =========================
        // 詳細表示
        // =========================
        document.getElementById(
            "detailBody"
        ).innerHTML =
            html;


        document.getElementById(
            "detailCard"
        ).style.display =
            "block";


        document.getElementById(
            "actionArea"
        ).style.display =
            "block";


        // =========================
        // ボタン表示
        // =========================
        const btn =
            document.getElementById(
                "actionBtn"
            );


        if(
            data.payment === "未"
        ){

            btn.innerText =
                "キャンセル";

        }
        else{

            btn.innerText =
                "売上取消";

        }


    }
    catch(err){

        console.error(
            "Detail Exception:",
            err
        );

        alert(
            "注文詳細の取得に失敗しました"
        );

    }

}


// =========================
// キャンセル・取消
// =========================
async function executeAction(){

    if(
        !currentOrder
    ){

        return;

    }


    const btn =
        document.getElementById(
            "actionBtn"
        );


    const action =
        btn.innerText;


    // =========================
    // 確認
    // =========================
    if(
        !confirm(
            action +
            "を実行しますか？"
        )
    ){

        return;

    }


    try{

        const res =
            await fetch(

                API_URL +
                "/api/sales/cancel",

                {

                    method:
                        "POST",

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
                        JSON.stringify({

                            type:
                                currentOrder.type,

                            orderNo:
                                currentOrder.no

                        })

                }

            );


        // =========================
        // HTTPエラー
        // =========================
        if(
            !res.ok
        ){

            const errorText =
                await res.text();

            console.error(
                "Cancel Error:",
                res.status,
                errorText
            );

            alert(
                "取消に失敗しました\n" +
                "HTTP " +
                res.status
            );

            return;

        }


        const data =
            await res.json();


        console.log(
            "Cancel Response:",
            data
        );


        // =========================
        // GAS / Workerエラー
        // =========================
        if(
            !data.success
        ){

            alert(
                data.message ||
                "取消に失敗しました"
            );

            return;

        }


        // =========================
        // 成功
        // =========================
        alert(
            action +
            "しました"
        );


        // 詳細を閉じる
        document.getElementById(
            "detailCard"
        ).style.display =
            "none";


        // ボタンを閉じる
        document.getElementById(
            "actionArea"
        ).style.display =
            "none";


        currentOrder =
            null;


        // 一覧再取得
        loadOrders();


    }
    catch(err){

        console.error(
            "Cancel Exception:",
            err
        );

        alert(
            "通信エラーが発生しました"
        );

    }

}
