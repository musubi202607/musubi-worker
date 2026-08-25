export default {
async fetch(request, env) {

  if (request.method === "OPTIONS") {
    return new Response(null,{status:204,headers:corsHeaders()});
  }

  const url = new URL(request.url);
  const path = url.pathname;

  // 商品
  if(path.startsWith("/api/products")) return handleProducts(request,env);
  if(path.startsWith("/api/materials")) return handleMaterials(request,env);
  if(path.startsWith("/api/recipe") || path==="/api/recipes") return handleRecipes(request,env);

  // カート・注文
  if(path.startsWith("/api/cart")) return handleCart(request,env);
  if(path==="/api/staff-order" && request.method==="POST") return handleStaffOrder(request,env);
  if(path.startsWith("/api/orders")) return handleOrders(request,env);
  if(path.startsWith("/api/order")) return handleOrder(request,env);

  // キッチンカー
  if(path==="/api/kitchen/order") return handleKitchenOrder(request,env);
  if(path==="/api/kitchen/unpaid") return handleKitchenUnpaid(request,env);
  if(path==="/api/kitchen/paid") return handleKitchenPaid(request,env);
  if(path==="/api/kitchen/sales" && request.method==="POST") return handleKitchenSales(request,env);
   
  // 会計
  if(path.startsWith("/api/unpaid")) return handleUnpaid(request,env);
  if(path.startsWith("/api/onigiri/paid")) return handleOnigiriPaid(request,env);
  if(path.startsWith("/api/bbq/unpaid")) return handleBBQUnpaid(request,env);
  if(path.startsWith("/api/bbq/paid")) return handleBBQPaid(request,env);
  if(path.startsWith("/api/payments/waiting")) return handlePaymentWaiting(request,env);

  // BBQ
  if(path.startsWith("/api/bbq/addOrder")) return handleBBQAddOrder(request,env);
  if(path.startsWith("/api/bbq/cancel")) return handleBBQCancel(request,env);
  if(path.startsWith("/api/bbq/checkin")) return handleBBQVisited(request,env);
  if(path.startsWith("/api/bbq/visited")) return handleBBQVisited(request,env);
  if(path.startsWith("/api/reservations")) return handleReservations(request,env);
  if(path.startsWith("/api/bbq/full-detail")) return handleBBQFullDetail(request,env);
  if(path.startsWith("/api/bbq/detail")) return handleBBQDetail(request,env);
  if(path.startsWith("/api/bbq/history")) return handleBBQHistory(request,env);

  // 売上
  if(path==="/api/sales" && request.method==="POST") return handleSales(request,env);
  if(path==="/api/sales/list" && request.method==="POST") return handleSalesList(request,env);
  if(path==="/api/sales/detail" && request.method==="POST") return handleSalesDetail(request,env);
  if(path==="/api/sales/cancel" && request.method==="POST") return handleSalesCancel(request,env);
  if(path==="/api/sales/csv" && request.method==="POST") return handleSalesCSV(request,env);

  // 管理
  if(path.startsWith("/api/dashboard")) return handleDashboard(request,env);
  if(path.startsWith("/api/admin/login")) return handleAdminLogin(request,env);
  if(path.startsWith("/api/admin/users")) return handleAdminUsers(request,env);
  if(path.startsWith("/api/admin/user/add")) return handleAdminAddUser(request,env);
  if(path.startsWith("/api/admin/user/update")) return handleAdminUpdateUser(request,env);
  if(path.startsWith("/api/admin/user/delete")) return handleAdminDeleteUser(request,env);
  if(path.startsWith("/api/admin/verify")) return handleAdminVerify(request,env);
  if(path.startsWith("/api/admin/logout")) return handleAdminLogout(request,env);
  if(path==="/api/test/hash") return json({hash:await sha256("現在のパスワード")});

  // カレンダー・店舗
  if(path.startsWith("/api/store-business-calendar")) return handleStoreBusinessCalendar(request,env);
  if(path.startsWith("/api/business-calendar")) return handleBusinessCalendar(request,env);
  if(path.startsWith("/api/calendar")) return handleCalendar(request,env);
  if(path.startsWith("/api/shop-settings")) return handleShopSettings(request,env);

  // LINE
  if(path.startsWith("/api/line/webhook")) return handleLineWebhook(request,env);

  return json({error:"Not Found"},404);
}
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    }
  });
}

async function handleProducts(request, env) {

  const url = new URL(request.url);


  // =========================
  // 商品一覧（公開）
  // D1取得
  // =========================
  if (
    request.method === "GET" &&
    url.pathname === "/api/products"
  ) {

    try {

      const { results } =
        await env.DB
          .prepare(`
            SELECT *
            FROM products
            WHERE status = '販売中'
            ORDER BY sort_order ASC
          `)
          .all();


      return json({

        success: true,

        products: results

      });


    } catch (error) {

      console.error(
        "handleProducts D1 GET ERROR:",
        error
      );


      return json({

        success: false,

        message: "D1 products fetch failed",

        error: error.message

      }, 500);

    }

  }



  // =========================
  // 商品追加
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/products"
  ) {


    const admin =
      await requireAdmin(request, env);


    if (!admin) {

      return json({

        success: false,

        message: "Unauthorized"

      }, 401);

    }


    const body =
      await request.json();


    const res =
      await fetch(env.GAS_URL, {

        method: "POST",

        headers: {

          "Content-Type": "application/json"

        },


        body: JSON.stringify({

          mode: "addProduct",

          ...body

        })

      });


    return json(
      await res.json()
    );

  }



  // =========================
  // 商品表示順一括更新
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/products/sort"
  ) {


    const admin =
      await requireAdmin(request, env);


    if (!admin) {

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }


    const body =
      await request.json();



    const res =
      await fetch(
        env.GAS_URL,
        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:JSON.stringify({

            mode:
              "updateProductSortOrder",

            type:
              body.type,

            items:
              body.items

          })

        }
      );


    return json(
      await res.json()
    );

  }



  // =========================
  // 商品更新
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/products/update"
  ) {


    const admin =
      await requireAdmin(request, env);


    if (!admin) {

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }


    const body =
      await request.json();


    const res =
      await fetch(env.GAS_URL, {

        method:"POST",

        headers:{

          "Content-Type":"application/json"

        },


        body:JSON.stringify({

          mode:"updateProduct",

          ...body

        })

      });


    return json(
      await res.json()
    );

  }



  // =========================
  // 商品削除
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/products/delete"
  ) {


    const admin =
      await requireAdmin(request, env);


    if (!admin) {

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }


    const body =
      await request.json();


    const res =
      await fetch(env.GAS_URL, {

        method:"POST",

        headers:{

          "Content-Type":"application/json"

        },


        body:JSON.stringify({

          mode:"deleteProduct",

          ...body

        })

      });


    return json(
      await res.json()
    );

  }



  return json({

    error:"products route error"

  },404);


}

async function getCart(env, sessionId) {
  const data = await env.CART_KV.get(sessionId);
  return data ? JSON.parse(data) : [];
}

async function setCart(env, sessionId, cart) {
  await env.CART_KV.put(sessionId, JSON.stringify(cart));
}

// =========================
// 材料管理
// =========================
async function handleMaterials(request, env) {

  const url = new URL(request.url);

  // =========================
  // 材料一覧
  // =========================
  if (
    request.method === "GET" &&
    url.pathname === "/api/materials"
  ) {

    const res =
      await fetch(
        env.GAS_URL +
        "?mode=getMaterials"
      );

    return json(
      await res.json()
    );

  }

    // =========================
  // 材料追加
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/materials"
  ) {

    // 管理者認証
    const admin =
      await requireAdmin(request, env);

    if (!admin) {

      return json({

        success: false,

        message: "Unauthorized"

      }, 401);

    }

    const body =
      await request.json();

    const res =
      await fetch(env.GAS_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          mode: "addMaterial",

          ...body

        })

      });

    return json(
      await res.json()
    );

  }


  // =========================
  // 材料更新
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/materials/update"
  ) {

    // 管理者認証
    const admin =
      await requireAdmin(request, env);

    if (!admin) {

      return json({

        success: false,

        message: "Unauthorized"

      }, 401);

    }

    const body =
      await request.json();

    const res =
      await fetch(env.GAS_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          mode: "updateMaterial",

          ...body

        })

      });

    return json(
      await res.json()
    );

  }

    // =========================
  // 材料削除
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/materials/delete"
  ) {

    // =========================
    // 管理者認証
    // =========================
    const admin =
      await requireAdmin(request, env);

    if (!admin) {

      return json({

        success: false,

        message: "Unauthorized"

      }, 401);

    }

    const body =
      await request.json();

    const res =
      await fetch(env.GAS_URL, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          mode: "deleteMaterial",

          ...body

        })

      });

    return json(
      await res.json()
    );

  }
  return json(
    {
      error:"materials route error"
    },
    404
  );

}

// =========================
// カートAPI
// =========================
async function handleCart(request, env) {

  const url = new URL(request.url);

  // =========================
  // カート取得
  // GET /api/cart
  // =========================
  if (
    request.method === "GET" &&
    url.pathname === "/api/cart"
  ) {

    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return json({ error: "no sessionId" }, 400);
    }

    return json(await getCart(env, sessionId));

  }

  // =========================
  // カート追加
  // POST /api/cart/add
  // =========================
  if (
    request.method === "POST" &&
    url.pathname === "/api/cart/add"
  ) {

    const body = await request.json();

    let cart = await getCart(env, body.sessionId);

    const existing = cart.find(
      i => Number(i.id) === Number(body.productId)
    );

    if (existing) {

      existing.qty += Number(body.qty || 1);

    } else {

      cart.push({

        id: Number(body.productId),

        qty: Number(body.qty || 1)

      });

    }

    await setCart(env, body.sessionId, cart);

    return json({ success: true });

  }

  // =========================
  // カート数量変更
  // POST /api/cart/update
  // =========================
  if (

    request.method === "POST" &&
    url.pathname === "/api/cart/update"

  ) {

    const body =
      await request.json();

    let cart =
      await getCart(
        env,
        body.sessionId
      );

    const item =
      cart.find(
        i =>
          Number(i.id) ===
          Number(body.productId)
      );

    if(item){

      item.qty =
        Number(body.qty);

      if(item.qty <= 0){

        cart =
          cart.filter(
            i =>
              Number(i.id) !==
              Number(body.productId)
          );

      }

    }

    await setCart(

      env,

      body.sessionId,

      cart

    );

    return json({

      success:true,

      cart

    });

  }
  // =========================
  // カートを空にする
  // DELETE /api/cart/clear
  // =========================
  if (
    request.method === "DELETE" &&
    url.pathname === "/api/cart/clear"
  ) {

    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return json({ error: "no sessionId" }, 400);
    }

    await env.CART_KV.delete(sessionId);

    return json({
      success: true
    });

  }

  // =========================
  // 未定義
  // =========================
  return json({
    error: "cart route error"
  }, 404);

}

// =========================
// おにぎり注文番号発番
// =========================
async function createOnigiriOrderNo(env) {

  const row =
    await env.DB
      .prepare(`
        SELECT
          order_no
        FROM
          onigiri_orders
        ORDER BY
          id DESC
        LIMIT 1
      `)
      .first();

  // -------------------------
  // 初回
  // -------------------------
  if (!row) {

    return "ON000001";

  }

  const lastNo =
    row.order_no;

  if (
    !lastNo ||
    String(lastNo).indexOf("ON") !== 0
  ) {

    return "ON000001";

  }

  let num =
    Number(
      String(lastNo)
        .replace("ON", "")
    );

  if (isNaN(num)) {

    num = 0;

  }

  num++;

  return (
    "ON" +
    String(num).padStart(6, "0")
  );

}
// =========================
// 注文登録
// =========================
async function handleOrder(request, env) {

  // =========================
  // メソッドチェック
  // =========================
  if (request.method !== "POST") {

    return json({

      success: false,

      message: "Method Not Allowed"

    }, 405);

  }

  // =========================
  // JSON取得
  // =========================
  let body;

  try {

    body =
      await request.json();

  } catch {

    return json({

      success: false,

      message: "Invalid JSON"

    }, 400);

  }

  const {

    sessionId,
    customerName,
    customerTel,
    pickupTime = "",
    memo = ""

  } = body;

  // =========================
  // 必須チェック
  // =========================
  if (!sessionId) {

    return json({

      success: false,

      message: "Missing sessionId"

    }, 400);

  }

  if (
    !customerName ||
    !customerTel
  ) {

    return json({

      success: false,

      message: "Missing customer info"

    }, 400);

  }

  // =========================
  // カート取得
  // =========================
  const cart =
    await getCart(
      env,
      sessionId
    );

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {

    return json({

      success: false,

      message: "Cart empty"

    }, 400);

  }

  // =========================
  // 商品取得（D1）
  // =========================
  const productResult =
    await env.DB
      .prepare(`
        SELECT *
        FROM products
        WHERE status='販売中'
      `)
      .all();

  const products =
    productResult.results || [];

  const productMap =
    new Map(
      products.map(p => [
        Number(p.id),
        p
      ])
    );

  // =========================
  // 注文番号生成
  // =========================
  const orderNo =
    await createOnigiriOrderNo(env);

  // =========================
  // 注文日時
  // =========================
  const orderDate =
    new Date()
      .toLocaleString(
        "ja-JP",
        {
          timeZone: "Asia/Tokyo"
        }
      );

  // =========================
  // 注文保存開始
  // =========================
  for (const item of cart) {

    const product =
      productMap.get(
        Number(item.id)
      );

    if (!product) {

      continue;

    }

    const qty =
      Number(item.qty);

    const price =
      Number(product.price);

    const amount =
      qty * price;

        // =========================
    // D1へ保存
    // =========================
    await env.DB
      .prepare(`
        INSERT INTO onigiri_orders
        (
          order_no,
          order_date,
          pickup_time,
          customer_name,
          customer_tel,
          item_name,
          quantity,
          unit_price,
          amount,
          memo,
          status,
          paid
        )
        VALUES
        (
          ?,?,?,?,?,?,?,?,?,?,?,?
        )
      `)
      .bind(

        orderNo,
        orderDate,
        pickupTime,
        customerName,
        customerTel,
        product.name,
        qty,
        price,
        amount,
        memo,
        "未",
        "未"

      )
      .run();

  }

  // =========================
  // カート削除
  // =========================
  try {

    await env.CART_KV.delete(
      sessionId
    );

  } catch (e) {

    console.error(
      "Cart Delete Error:",
      e
    );

  }

  // =========================
  // 完了
  // =========================
  return json({

    success: true,

    orderNo

  });

}


// =========================
// おにぎり未会計
// =========================
async function handleUnpaid(request, env) {


  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  const url =
    new URL(request.url);


  const type =
    url.searchParams.get("type");



  if(type === "onigiri"){


    const res =
      await fetch(
        env.GAS_URL +
        "?mode=onigiriUnpaid"
      );


    return json(
      await res.json()
    );


  }


  return json({

    error:"unknown type"

  },400);


}

// =========================
// おにぎり会計済
// =========================
async function handleOnigiriPaid(request, env) {


  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  // =========================
  // POST確認
  // =========================
  if(request.method !== "POST"){

    return json({

      success:false,

      message:"Method Not Allowed"

    },405);

  }


  // =========================
  // データ取得
  // =========================
  const body =
    await request.json();



  // =========================
  // GASへ送信
  // =========================
  const res =
    await fetch(
      env.GAS_URL,
      {

        method:"POST",

        headers:{
          "Content-Type":
          "application/json"
        },


        body:
          JSON.stringify({

            mode:"onigiriPaid",

            orderNo:
              body.orderNo

          })

      }
    );


  return json(
    await res.json()
  );


}

// =========================
// BBQ未会計
// =========================
async function handleBBQUnpaid(request, env) {


  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  // =========================
  // GAS取得
  // =========================
  const res =
    await fetch(
      env.GAS_URL +
      "?mode=bbqUnpaid"
    );


  const text =
    await res.text();



  return new Response(

    text,

    {

      headers:{

        "Content-Type":
          "application/json",

        ...corsHeaders()

      }

    }

  );


}


// =========================
// BBQ会計済
// =========================
async function handleBBQPaid(request, env) {


  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  // =========================
  // POST確認
  // =========================
  if(request.method !== "POST"){

    return json({

      success:false,

      message:"Method Not Allowed"

    },405);

  }


  // =========================
  // データ取得
  // =========================
  const body =
    await request.json();



  // =========================
  // GASへ送信
  // =========================
  const res =
    await fetch(
      env.GAS_URL,
      {

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },


        body:
          JSON.stringify({

            mode:
              "bbqPaid",

            reservationNo:
              body.reservationNo

          })

      }
    );


  return json(
    await res.json()
  );


}

// =========================
// BBQ予約管理
// =========================
async function handleReservations(request, env) {


  // =========================
  // 本日の予約取得
  // =========================
  if (
    request.method === "GET" &&
    request.url.includes("/today")
  ) {

    try {

      const result =
        await env.DB
          .prepare(`
            SELECT *
            FROM bbq_reservations
            WHERE use_date = date('now','localtime')
            ORDER BY id ASC
          `)
          .all();


      return json(
        result.results || []
      );


    } catch(error) {


      console.error(
        "todayReservations error",
        error
      );


      return json(
        {
          success:false,
          message:"予約取得エラー"
        },
        500
      );


    }

  }



  // =========================
  // BBQ予約保存
  // =========================
  if (
    request.method === "POST"
  ) {


    let body;


    try {

      body =
        await request.json();

    } catch {


      return json(
        {
          success:false,
          message:"Invalid JSON"
        },
        400
      );

    }



    const {

      useDate,
      plan,
      unitPrice,
      people,
      customerName,
      customerTel,
      memo = ""

    } = body;



    if (
      !useDate ||
      !plan ||
      !customerName ||
      !customerTel
    ) {


      return json(
        {
          success:false,
          message:"Missing required fields"
        },
        400
      );


    }



    // =========================
    // 予約番号生成
    // GAS互換
    // BBQ-XXXXXXXX
    // =========================
    const reservationNo =

      "BBQ-" +

      crypto
        .randomUUID()
        .replace(/-/g,"")
        .slice(0,8)
        .toUpperCase();



    const reservationDate =

      new Date()
        .toLocaleString(
          "ja-JP",
          {
            timeZone:"Asia/Tokyo"
          }
        );



    const amount =

      Number(unitPrice || 0) *
      Number(people || 0);



    // =========================
    // D1保存
    // =========================
    await env.DB
      .prepare(`
        INSERT INTO bbq_reservations
        (
          reservation_no,
          reservation_date,
          use_date,
          customer_name,
          customer_tel,
          people,
          plan,
          unit_price,
          amount,
          memo,
          status,
          paid
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?,?)
      `)
      .bind(

        reservationNo,
        reservationDate,
        useDate,
        customerName,
        customerTel,
        Number(people),
        plan,
        Number(unitPrice),
        amount,
        memo,
        "未",
        "未"

      )
      .run();



    return json({

      success:true,

      reservationNo

    });


  }



  return json(
    {
      success:false,
      message:"method error"
    },
    405
  );

}

// =========================
// BBQ予約詳細
// =========================
async function handleBBQDetail(request, env) {

  const url =
    new URL(request.url);

  const reservationNo =
    url.searchParams.get("reservationNo") ||
    url.searchParams.get("no");


  const res =
    await fetch(
      env.GAS_URL +
      "?mode=bbqReservationDetail&no=" +
      encodeURIComponent(reservationNo)
    );


  const text =
    await res.text();


  return new Response(
    text,
    {
      headers:{
        "Content-Type":
          "application/json",
        ...corsHeaders()
      }
    }
  );

}

// =========================
// BBQ追加注文履歴
// =========================
async function handleBBQHistory(request, env) {

  const url =
    new URL(request.url);


  const reservationNo =
    url.searchParams.get("reservationNo") ||
    url.searchParams.get("no");


  const res =
    await fetch(
      env.GAS_URL +
      "?mode=bbqOrderHistory&no=" +
      encodeURIComponent(reservationNo)
    );


  const text =
    await res.text();


  return new Response(
    text,
    {
      headers:{
        "Content-Type":
          "application/json",
        ...corsHeaders()
      }
    }
  );

}

// =========================
// BBQ予約完全詳細
// =========================
async function handleBBQFullDetail(
  request,
  env
){

  const url =
    new URL(request.url);


  const reservationNo =
    url.searchParams.get("reservationNo") ||
    url.searchParams.get("no");


  const res =
    await fetch(

      env.GAS_URL +
      "?mode=bbqFullDetail&no=" +
      encodeURIComponent(
        reservationNo
      )

    );


  const text =
    await res.text();


  return new Response(

    text,

    {
      headers:{
        "Content-Type":
          "application/json",

        ...corsHeaders()
      }
    }

  );

}

async function handleBBQAddOrder(request, env) {

  if(request.method !== "POST"){

    return json({
      success:false,
      message:"Method Not Allowed"
    },405);

  }


  try{


    const body =
      await request.json();


    const {

      reservationNo,
      useDate,
      customerName,
      customerTel = "",
      memo = "",
      items = []

    } = body;



    if(
      !reservationNo ||
      !items.length
    ){

      return json({

        success:false,
        message:"Missing data"

      },400);

    }



    const orderDate =
      new Date()
      .toLocaleString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo"
        }
      );



    for(const item of items){


      const amount =
        Number(item.price) *
        Number(item.qty);



      await env.DB
      .prepare(`
        INSERT INTO bbq_option_orders
        (
          reservation_no,
          order_date,
          use_date,
          customer_name,
          item_name,
          quantity,
          unit_price,
          amount,
          memo,
          status,
          paid
        )
        VALUES
        (?,?,?,?,?,?,?,?,?,?,?)
      `)
      .bind(

        reservationNo,

        orderDate,

        useDate,

        customerName,

        item.name,

        Number(item.qty),

        Number(item.price),

        amount,

        memo,

        "未",

        "未"

      )
      .run();


    }



    return json({

      success:true

    });



  }catch(e){


    console.error(
      "handleBBQAddOrder Error:",
      e
    );


    return json({

      success:false,

      message:e.message

    },500);


  }


}

// =========================
// BBQ予約キャンセル
// =========================
async function handleBBQCancel(request, env){

  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  if(request.method !== "POST"){

    return json({
      success:false,
      message:"Method Not Allowed"
    },405);

  }

  const body =
    await request.json();

  const res =
    await fetch(env.GAS_URL,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        mode:"cancelBBQReservation",

        reservationNo:
          body.reservationNo

      })

    });

  const result =
    await res.json();

  return json(result);

}

function getReservations() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("reservations");

  const data = sheet.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < data.length; i++) {
    result.push({
      reservationNo: data[i][0],
      date: data[i][1],
      plan: data[i][2],
      people: data[i][3],
      name: data[i][4],
      tel: data[i][5],
      memo: data[i][6],
      status: data[i][7]
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// =========================
// 売上集計
// =========================
async function handleSales(
  request,
  env
){

  // =========================
  // 管理者認証
  // =========================
  const admin =
    await requireAdmin(
      request,
      env
    );

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  // =========================
  // POST確認
  // =========================
  if(
    request.method !== "POST"
  ){

    return json({

      success:false,

      message:"Method Error"

    },405);

  }

  // =========================
  // リクエスト取得
  // =========================
  let body;

  try{

    body =
      await request.json();

  }catch(error){

    return json({

      success:false,

      message:"Invalid JSON",

      error:error.message

    },400);

  }

  // =========================
  // GASへ送信
  // =========================
  let res;

  try{

    res =
      await fetch(

        env.GAS_URL,

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify({

              mode:
                "salesSummary",

              startDate:
                body.startDate || "",

              endDate:
                body.endDate || ""

            })

        }

      );

  }catch(error){

    console.error(
      "SALES GAS FETCH ERROR:",
      error
    );

    return json({

      success:false,

      message:"GAS request failed",

      error:error.message

    },502);

  }

  // =========================
  // GASレスポンス取得
  // =========================
  const text =
    await res.text();

  console.log(
    "SALES GAS STATUS =",
    res.status
  );

  console.log(
    "SALES GAS RAW =",
    text
  );

  // =========================
  // GAS HTTPエラー
  // =========================
  if(!res.ok){

    return json({

      success:false,

      message:"GAS sales API error",

      status:res.status,

      detail:text

    },502);

  }

  // =========================
  // JSON確認
  // =========================
  let data;

  try{

    data =
      JSON.parse(text);

  }catch(error){

    console.error(
      "SALES GAS INVALID JSON:",
      text
    );

    return json({

      success:false,

      message:"Invalid GAS sales response",

      detail:text

    },502);

  }

  // =========================
  // 正常終了
  // =========================
  return json(data);

}

// =========================
// BBQ来店済
// =========================
async function handleBBQVisited(request, env){

  const body =
    await request.json();


  const res =
    await fetch(
      env.GAS_URL,
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          mode:"bbqVisited",

          reservationNo:
            body.reservationNo

        })

      }
    );


  const text =
    await res.text();


  return new Response(
    text,
    {

      headers:{
        "Content-Type":
          "application/json",

        ...corsHeaders()

      }

    }
  );

}

// =========================
// ダッシュボード
// =========================
async function handleDashboard(request, env){

  // =========================
  // 管理者認証
  // =========================

  const admin =
    await requireAdmin(
      request,
      env
    );

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  // =========================
  // GETのみ
  // =========================

  if(request.method !== "GET"){

    return json({

      success:false,

      message:"Method Not Allowed"

    },405);

  }

  // =========================
  // GAS呼び出し
  // =========================

  try{

    const response =
      await fetch(

        env.GAS_URL +

        "?mode=dashboard"

      );

    if(!response.ok){

      throw new Error(

        "GAS Error : " +

        response.status

      );

    }

    const result =
      await response.text();

    return new Response(

      result,

      {

        headers:{

          "Content-Type":"application/json",

          ...corsHeaders()

        }

      }

    );

  }

  catch(error){

    console.error(error);

    return json({

      success:false,

      message:"Dashboard Error",

      detail:error.message

    },500);

  }

}

// =========================
// 注文管理（D1版）
// =========================
async function handleOrders(request, env) {

  // =========================
  // 認証
  // =========================
  const admin =
    await requireAdmin(request, env);

  if (!admin) {

    return json({

      success: false,

      message: "Unauthorized"

    }, 401);

  }


  // =========================
  // GETのみ
  // =========================
  if (request.method !== "GET") {

    return json({

      success: false,

      message: "Method Not Allowed"

    }, 405);

  }


  const url =
    new URL(request.url);


  const type =
    url.searchParams.get("type") || "";


  const start =
    url.searchParams.get("start") || "";


  const end =
    url.searchParams.get("end") || "";


  let table = "";


  // =========================
  // テーブル判定
  // =========================
  switch(type) {

    case "onigiri":
    case "drink":
      table = "onigiri_orders";
      break;


    case "bbq":
      table = "bbq_reservations";
      break;


    case "bbq-option":
      table = "bbq_option_orders";
      break;


    case "kitchen":
      table = "kitchen_orders";
      break;


    default:

      return json({

        success:false,

        message:"Invalid order type"

      },400);

  }


  try {


    let sql =
      `SELECT * FROM ${table}`;


    const params = [];


    // =========================
    // 期間検索
    // =========================
    if(start && end) {

      sql +=
        ` WHERE order_date BETWEEN ? AND ?`;

      params.push(
        start,
        end
      );

    }


    sql +=
      ` ORDER BY id DESC`;


    const result =
      await env.DB
        .prepare(sql)
        .bind(...params)
        .all();



    // =========================
    // 既存形式へ変換
    // =========================
    const orders =
      result.results.map(row => {


        return {

          orderNo:
            row.order_no ||
            row.reservation_no ||
            "",


          orderDate:
            row.order_date ||
            "",


          pickupTime:
            row.pickup_time ||
            row.use_date ||
            "",


          customerName:
            row.customer_name ||
            "",


          customerTel:
            row.customer_tel ||
            "",


          itemName:
            row.item_name ||
            row.plan ||
            "",


          qty:
            row.quantity ||
            row.people ||
            0,


          unitPrice:
            row.unit_price ||
            0,


          amount:
            row.amount ||
            0,


          memo:
            row.memo ||
            "",


          status:
            row.status ||
            "",


          paid:
            row.paid ||
            row.payment ||
            ""

        };


      });



    return json({

      success:true,

      orders

    });



  } catch(error) {


    console.error(
      "D1 orders error",
      error
    );


    return json({

      success:false,

      message:"D1 orders fetch failed",

      error:error.message

    },500);


  }

}

// =========================
// 会計待ち一覧
// D1版
// =========================
async function handlePaymentWaiting(request, env) {

  const admin =
    await requireAdmin(
      request,
      env
    );


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  const result = [];


  try{


// =========================
// おにぎり未会計
// =========================
const onigiri =
  await env.DB
  .prepare(`
    SELECT *
    FROM onigiri_orders
    WHERE paid IS NULL
       OR paid != '会計済'
    ORDER BY order_no DESC, id ASC
  `)
  .all();


const onigiriMap = {};


onigiri.results.forEach(row=>{


  if(!onigiriMap[row.order_no]){


    onigiriMap[row.order_no] = {

      type:"onigiri",

      no:
        row.order_no,

      customerName:
        row.customer_name || "",

      items:[],

      total:0

    };

  }



  onigiriMap[row.order_no]
  .items.push({

    name:
      row.item_name,

    qty:
      Number(row.quantity || 0),

    price:
      Number(row.unit_price || 0)

  });



  onigiriMap[row.order_no].total +=
    Number(row.amount || 0);


});



Object.values(onigiriMap)
.forEach(item=>{


  item.itemTotal =
    item.total;


  result.push(item);


});



    // =========================
// BBQ未会計
// =========================
const bbq =
  await env.DB
  .prepare(`
    SELECT *
    FROM bbq_reservations
    WHERE paid IS NULL
       OR paid != '会計済'
    ORDER BY id DESC
  `)
  .all();



// =========================
// BBQ追加注文取得
// =========================
const bbqOptions =
  await env.DB
  .prepare(`
    SELECT *
    FROM bbq_option_orders
    WHERE paid IS NULL
       OR paid != '会計済'
    ORDER BY id ASC
  `)
  .all();



const optionMap = {};



bbqOptions.results.forEach(row=>{


  if(!optionMap[row.reservation_no]){

    optionMap[row.reservation_no] = [];

  }


  optionMap[row.reservation_no].push({

    name:
      row.item_name,

    qty:
      Number(row.quantity || 0),

    price:
      Number(row.unit_price || 0)

  });


});



bbq.results.forEach(row=>{


  const options =
    optionMap[row.reservation_no] || [];



  let optionTotal = 0;


  options.forEach(item=>{

    optionTotal +=
      item.qty * item.price;

  });



  result.push({


    type:"bbq",


    no:
      row.reservation_no,


    customerName:
      row.customer_name || "",


    plan:
      row.plan || "",


    people:
      Number(row.people || 0),


    unitPrice:
      Number(row.unit_price || 0),


    bbqPrice:
      Number(row.amount || 0),


    optionItems:
      options,


    optionTotal,


    total:
      Number(row.amount || 0)
      +
      optionTotal


  });


});



   // =========================
// キッチンカー未会計
// =========================
const kitchen =
  await env.DB
  .prepare(`
    SELECT *
    FROM kitchen_orders
    WHERE payment IS NULL
       OR payment != '会計済'
    ORDER BY order_no DESC, id ASC
  `)
  .all();



const kitchenMap = {};



kitchen.results.forEach(row=>{


  if(!kitchenMap[row.order_no]){


    kitchenMap[row.order_no]={


      type:"kitchen",


      no:
        row.order_no,


      customerName:
        row.vehicle_no || "",


      items:[],


      total:0


    };


  }



  kitchenMap[row.order_no]
  .items.push({


    name:
      row.item_name,


    qty:
      Number(row.quantity || 0),


    price:
      Number(row.unit_price || 0)


  });



  kitchenMap[row.order_no].total +=
    Number(row.amount || 0);



});



Object.values(kitchenMap)
.forEach(item=>{


  item.itemTotal =
    item.total;


  result.push(item);


});

    // =========================
    // 並び替え
    // 新しい注文を上へ
    // =========================
    result.sort((a,b)=>{

      if(a.no < b.no) return 1;
      if(a.no > b.no) return -1;

      return 0;

    });


    return json(result);


  }catch(error){


    console.error(
      "handlePaymentWaiting D1 error",
      error
    );


    return json({

      success:false,

      message:"D1 payment waiting failed",

      error:error.message

    },500);


  }

}


// =========================
// 管理者ログイン（KV方式 NEXT版）
// =========================
async function handleAdminLogin(request, env) {


  if(request.method !== "POST"){

    return json(
      {
        success:false,
        message:"POST only"
      },
      405
    );

  }


  const body =
    await request.json();


  const id =
    body.id;


  const password =
    body.password;



  // =========================
  // ユーザー取得
  // =========================
  const usersJson =
    await env.MUSUBI_ADMIN_USERS_NEXT.get("users");


  if(!usersJson){

    return json({

      success:false,

      message:"user data not found"

    });

  }



  const users =
    JSON.parse(usersJson);



  const user =
    users[id];



  // =========================
  // パスワード確認
  // =========================

  const passwordHash =
    await sha256(password);



  if(

    !user ||

    (
      user.password !== password &&
      user.passwordHash !== passwordHash
    )

  ){

    return json({

      success:false,

      message:"login failed"

    });

  }



  // =========================
  // 平文パスワード削除
  // =========================

  if(user.password){

    delete user.password;


    await env.MUSUBI_ADMIN_USERS_NEXT.put(

      "users",

      JSON.stringify(users)

    );

  }



  // =========================
  // トークン発行
  // =========================

  const token =
    crypto.randomUUID();



  // =========================
  // セッション保存
  // =========================

  await env.MUSUBI_ADMIN_SESSION_NEXT.put(

    token,

    JSON.stringify({

      id:id,

      name:user.name,

      role:user.role,

      loginTime:Date.now()

    }),

    {

      expirationTtl:
        60 * 60 * 24 * 7

    }

  );



  return json({

    success:true,

    token,

    user:{

      id,

      name:user.name,

      role:user.role

    }

  });


}



// =========================
// 管理者一覧
// =========================
async function handleAdminUsers(request, env){

  const admin =
    await requireOwner(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  const usersJson =
    await env.ADMIN_KV.get("users");

  const users =
    JSON.parse(
      usersJson || "{}"
    );

  const list = [];

  Object.keys(users).forEach(id=>{

    const user =
      users[id];

    list.push({

      id,

      name:user.name,

      role:user.role,

      enabled:
        user.enabled !== false

    });

  });

  return json({

    success:true,

    users:list

  });

}

// =========================
// 管理者追加
// =========================
async function handleAdminAddUser(request, env){

  const admin =
    await requireOwner(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  if(request.method !== "POST"){

    return json({

      success:false,

      message:"POST only"

    },405);

  }

  const body =
    await request.json();

  const id =
    (body.id || "").trim();

  const name =
    (body.name || "").trim();

  const password =
    body.password || "";

  const role =
    body.role || "staff";

  const enabled =
    body.enabled !== false;

  // =========================
  // 入力チェック
  // =========================
  if(!id){

    return json({

      success:false,

      message:"ログインIDを入力してください"

    });

  }

  if(!name){

    return json({

      success:false,

      message:"表示名を入力してください"

    });

  }

  if(!password){

    return json({

      success:false,

      message:"パスワードを入力してください"

    });

  }

  // =========================
  // ユーザー取得
  // =========================
  const usersJson =
    await env.ADMIN_KV.get("users");

  const users =
    JSON.parse(
      usersJson || "{}"
    );

  // =========================
  // 重複チェック
  // =========================
  if(users[id]){

    return json({

      success:false,

      message:"同じIDが存在します"

    });

  }

  // =========================
  // 登録
  // =========================
  users[id]={

    passwordHash:
      await sha256(password),

    name,

    role,

    enabled

  };

  await env.ADMIN_KV.put(

    "users",

    JSON.stringify(users)

  );

  return json({

    success:true

  });

}

// =========================
// 管理者更新
// =========================
async function handleAdminUpdateUser(request, env){

  const admin =
    await requireOwner(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  if(request.method !== "POST"){

    return json({

      success:false,

      message:"POST only"

    },405);

  }

  const body =
    await request.json();

  const id =
    (body.id || "").trim();

  const name =
    (body.name || "").trim();

  const password =
    body.password || "";

  const role =
    body.role || "staff";

  const enabled =
    body.enabled !== false;

  if(!id){

    return json({

      success:false,

      message:"IDがありません"

    });

  }

  const usersJson =
    await env.ADMIN_KV.get("users");

  const users =
    JSON.parse(
      usersJson || "{}"
    );

  const user =
    users[id];

  if(!user){

    return json({

      success:false,

      message:"ユーザーが存在しません"

    });

  }

  // =========================
  // 更新
  // =========================
  user.name = name;

  user.role = role;

  user.enabled = enabled;


  // パスワードは入力時のみ変更
  if(password){

    user.passwordHash =
      await sha256(password);

  // 古い平文パスワード削除
    delete user.password;

  }


  users[id] = user;


  await env.ADMIN_KV.put(

    "users",

    JSON.stringify(users)

  );

  return json({

    success:true

  });

}

// =========================
// 管理者削除
// =========================
async function handleAdminDeleteUser(request, env){

  const admin =
    await requireOwner(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  if(request.method !== "POST"){

    return json({

      success:false,

      message:"POST only"

    },405);

  }


  const body =
    await request.json();


  const id =
    (body.id || "").trim();



  if(!id){

    return json({

      success:false,

      message:"IDがありません"

    });

  }



  // =========================
  // 自分自身削除防止
  // =========================
  if(id === admin.id){

    return json({

      success:false,

      message:"自分自身は削除できません"

    });

  }



  const usersJson =
    await env.ADMIN_KV.get("users");


  const users =
    JSON.parse(
      usersJson || "{}"
    );



  const user =
    users[id];



  if(!user){

    return json({

      success:false,

      message:"ユーザーが存在しません"

    });

  }



  // =========================
  // owner削除防止
  // =========================
  if(user.role === "owner"){

    return json({

      success:false,

      message:"管理者は削除できません"

    });

  }



  delete users[id];



  await env.ADMIN_KV.put(

    "users",

    JSON.stringify(users)

  );



  return json({

    success:true

  });


}

// =========================
// 管理者認証 NEXT版
// =========================
async function requireAdmin(request, env){


  const auth =
    request.headers.get(
      "Authorization"
    );


  if(

    !auth ||

    !auth.startsWith("Bearer ")

  ){

    return null;

  }



  const token =
    auth.replace(
      "Bearer ",
      ""
    );



  // =========================
  // セッション取得
  // =========================

  const sessionJson =
    await env.MUSUBI_ADMIN_SESSION_NEXT.get(
      token
    );


  if(!sessionJson){

    return null;

  }



  const session =
    JSON.parse(sessionJson);



  const SESSION_EXPIRE =
    7 *
    24 *
    60 *
    60 *
    1000;



  // =========================
  // 有効期限確認
  // =========================

  if(

    Date.now()
    -
    session.loginTime
    >
    SESSION_EXPIRE

  ){

    await env.MUSUBI_ADMIN_SESSION_NEXT.delete(
      token
    );


    return null;

  }



  // =========================
  // ユーザー確認
  // =========================

  const usersJson =
    await env.MUSUBI_ADMIN_USERS_NEXT.get(
      "users"
    );


  const users =
    JSON.parse(
      usersJson || "{}"
    );



  const user =
    users[session.id];



  if(

    !user ||

    user.enabled === false

  ){

    await env.MUSUBI_ADMIN_SESSION_NEXT.delete(
      token
    );


    return null;

  }



  // =========================
  // スライディング更新
  // =========================

  session.loginTime =
    Date.now();



  await env.MUSUBI_ADMIN_SESSION_NEXT.put(

    token,

    JSON.stringify(session),

    {

      expirationTtl:
        60 * 60 * 24 * 7

    }

  );



  return {

    token,

    id:
      session.id,

    name:
      user.name,

    role:
      user.role

  };


}

// =========================
// owner確認
// =========================
async function requireOwner(request, env){

  const admin =
    await requireAdmin(
      request,
      env
    );

  if(!admin){

    return null;

  }

  if(
    admin.role !==
    "owner"
  ){

    return null;

  }

  return admin;

}

// =========================
// SHA-256
// =========================
async function sha256(text){

  const data =
    new TextEncoder().encode(text);

  const hashBuffer =
    await crypto.subtle.digest(
      "SHA-256",
      data
    );

  const hashArray =
    Array.from(
      new Uint8Array(hashBuffer)
    );

  return hashArray
    .map(b =>
      b.toString(16)
       .padStart(2,"0")
    )
    .join("");

}

// =========================
// ログイン状態確認
// =========================
async function handleAdminVerify(request, env){

  if(request.method !== "GET"){

    return json({

      success:false,

      message:"GET only"

    },405);

  }

  const admin =
    await requireAdmin(request, env);

  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  return json({

    success:true,

    user:{

      id:admin.id,

      name:admin.name,

      role:admin.role

    }

  });

}

// =========================
// ログアウト
// =========================
async function handleAdminLogout(request, env){

  if(request.method !== "POST"){

    return json({

      success:false,

      message:"POST only"

    },405);

  }

  const auth =
    request.headers.get("Authorization");

  if(
    !auth ||
    !auth.startsWith("Bearer ")
  ){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }

  const token =
    auth.replace("Bearer ","");

  // =========================
  // セッション削除
  // =========================
  await env.ADMIN_SESSION.delete(token);

  return json({

    success:true

  });

}

// =========================
// スタッフ端末での注文
// =========================
async function handleStaffOrder(request, env){

  const data = await request.json();

  const paymentStatus =
    data.unpaid === true
      ? "未"
      : "済";

/*
  console.log(
    "STAFF ORDER DEBUG:",
    JSON.stringify({
      unpaid: data.unpaid,
      paymentStatus: paymentStatus
    })
  );
*/  
  const gasData = {

     mode:"saveOrder",

     orderSource:"staff",

     customerName:
       data.name || "",

     customerTel:
       data.phone || "",

     pickupTime:
       data.pickupTime || "",

     memo:
       data.note || "",
 
    // 会計状態をGASへ渡す
    paymentStatus:

      paymentStatus,

    items:
      data.items.map(item => ({

        name:
          item.name,

        qty:
          item.quantity,

        price:
          item.price

      }))

  };

  const res =
    await fetch(
      env.GAS_URL,
      {

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify(gasData)

      }
    );

  return json(
    JSON.parse(
      await res.text()
    )
  );

}

// =========================
// BBQ営業日管理
// =========================
async function handleBusinessCalendar(request, env){

  // -------------------------
  // 一覧取得（公開）
  // -------------------------
  if(request.method === "GET"){

    const res =
      await fetch(
        env.GAS_URL +
        "?mode=businessCalendar"
      );

    if(!res.ok){

      return json({

        success:false,

        message:"GAS Error"

      },500);

    }

    const text =
      await res.text();

    return new Response(text,{
      headers:{
        "Content-Type":"application/json",
        ...corsHeaders()
      }
    });

  }

  // -------------------------
  // 更新（追加・更新）
  // -------------------------
  if(request.method === "POST"){

    // =========================
    // 認証
    // =========================
    const admin =
      await requireAdmin(request, env);

    if(!admin){

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }

    const body =
      await request.json();

    const res =
      await fetch(env.GAS_URL,{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          mode:"updateBusinessCalendar",

          date:body.date,

          status:body.status,

          limit:body.limit

        })

      });

    if(!res.ok){

      return json({

        success:false,

        message:"GAS Error"

      },500);

    }

    const text =
      await res.text();

    return new Response(text,{
      headers:{
        "Content-Type":"application/json",
        ...corsHeaders()
      }
    });

  }

  // -------------------------
  // 例外削除
  // -------------------------
  if(request.method === "DELETE"){

    // =========================
    // 認証
    // =========================
    const admin =
      await requireAdmin(request, env);

    if(!admin){

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }

    const body =
      await request.json();

    const res =
      await fetch(env.GAS_URL,{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          mode:"deleteBusinessCalendar",

          date:body.date

        })

      });

    if(!res.ok){

      return json({

        success:false,

        message:"GAS Error"

      },500);

    }

    const text =
      await res.text();

    return new Response(text,{
      headers:{
        "Content-Type":"application/json",
        ...corsHeaders()
      }
    });

  }

  return json({

    success:false,

    message:"Method Not Allowed"

  },405);

}

// =========================
// 店舗営業日管理
// =========================
async function handleStoreBusinessCalendar(request, env){


  // =========================
  // GET
  // 公開取得（TOPページ用）
  // =========================
  if(request.method === "GET"){


    const res =
      await fetch(
        env.GAS_URL +
        "?mode=storeBusinessCalendar"
      );


    if(!res.ok){

      return json({

        success:false,

        message:"GAS Error"

      },500);

    }


    const text =
      await res.text();



    return new Response(
      text,
      {

        headers:{

          "Content-Type":
            "application/json",

          ...corsHeaders()

        }

      }
    );


  }




  // =========================
  // POST / DELETE
  // 管理者認証
  // =========================

  const admin =
    await requireAdmin(
      request,
      env
    );


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }




  // =========================
  // 店舗営業日更新
  // =========================
  if(request.method === "POST"){


    const body =
      await request.json();



    const res =
      await fetch(
        env.GAS_URL,
        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:
            JSON.stringify({

              mode:
                "updateStoreBusinessCalendar",

              date:
                body.date,

              status:
                body.status

            })

        }
      );



    const text =
      await res.text();



    return new Response(
      text,
      {

        headers:{

          "Content-Type":
            "application/json",

          ...corsHeaders()

        }

      }
    );


  }





  // =========================
  // 店舗営業日削除
  // =========================
  if(request.method === "DELETE"){


    const body =
      await request.json();



    const res =
      await fetch(
        env.GAS_URL,
        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json"

          },


          body:
            JSON.stringify({

              mode:
                "deleteStoreBusinessCalendar",

              date:
                body.date

            })

        }
      );



    const text =
      await res.text();



    return new Response(
      text,
      {

        headers:{

          "Content-Type":
            "application/json",

          ...corsHeaders()

        }

      }
    );


  }




  return json({

    success:false,

    message:"Method Not Allowed"

  },405);


}

function renderCalendar() {

  const target =
    document.getElementById("calendar");

  if (!target) return;

  target.innerHTML = "";

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  target.innerHTML += `
    <div class="calendar-header">
      <button onclick="prevMonth()">←</button>
      <h2>${year}年 ${month + 1}月</h2>
      <button onclick="nextMonth()">→</button>
    </div>

    <div class="calendar-grid">

      <div class="calendar-week">日</div>
      <div class="calendar-week">月</div>
      <div class="calendar-week">火</div>
      <div class="calendar-week">水</div>
      <div class="calendar-week">木</div>
      <div class="calendar-week">金</div>
      <div class="calendar-week">土</div>
  `;

  for (let i = 0; i < startDay; i++) {
    target.innerHTML += "<div></div>";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let day = 1; day <= totalDays; day++) {

    const dateObj = new Date(year, month, day);
    const dateStr = formatDate(dateObj);

    const item =
      calendarData.find(
        d => d.date === dateStr
      );

    if (!item) {

      target.innerHTML += "<div></div>";
      continue;

    }

    let className = "calendar-day";
    let disabled = "";
    let statusText = "";

    // 過去日は受付終了
    if (dateObj < today) {

      className += " closed";
      disabled = "disabled";
      statusText = "受付終了";

    }

    // 予約可能
    else if (item.status === "○" && item.limit > 0) {

      className += " available";
      statusText = `あと${item.limit}組`;

    }

    // 予約不可
    else {

      className += " closed";
      disabled = "disabled";
      statusText = "予約不可";

    }

    // 選択済み
    if (reservation.date === dateStr) {

      className += " selected";

    }

    target.innerHTML += `
      <button
        class="${className}"
        ${disabled}
        onclick="selectDate('${dateStr}', this)"
      >

        <div class="calendar-date">
          ${day}
        </div>

        <div class="calendar-status">
          ${statusText}
        </div>

      </button>
    `;

  }

  target.innerHTML += "</div>";

}

// =========================
// 店舗営業日管理
// =========================
async function handleCalendar(request, env){

  // 取得
  if(request.method === "GET"){

    const res =
      await fetch(
        env.GAS_URL +
        "?mode=storeBusinessCalendar"
      );


    const text =
      await res.text();


    return new Response(
      text,
      {
        headers:{
          "Content-Type":"application/json",
          ...corsHeaders()
        }
      }
    );

  }


  // 更新
  if(request.method === "POST"){

    const body =
      await request.json();


    const res =
      await fetch(
        env.GAS_URL,
        {
          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            mode:"updateStoreBusinessCalendar",

            date:body.date,

            status:body.status

          })
        }
      );


    const text =
      await res.text();


    return new Response(
      text,
      {
        headers:{
          "Content-Type":"application/json",
          ...corsHeaders()
        }
      }
    );

  }


  return json(
    {
      success:false,
      message:"Method Not Allowed"
    },
   405
  );

}

// =========================
// 店舗情報
// =========================
async function handleShopSettings(request, env){


  // =========================
  // GET 取得（公開）
  // =========================
  if(request.method === "GET"){

    const res =
      await fetch(

        env.GAS_URL +
        "?mode=shopSettings"

      );


    const text =
      await res.text();


    console.log(
      "GAS RAW =",
      text
    );


    return json(
      JSON.parse(text)
    );

  }



  // =========================
  // POST 更新（管理者）
  // =========================
  if(request.method === "POST"){


    const admin =
      await requireAdmin(request, env);


    if(!admin){

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }


    try{

      const body =
        await request.json();


      const res =
        await fetch(

          env.GAS_URL,

          {

            method:"POST",

            headers:{

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                mode:
                  "updateShopSettings",

                ...body

              })

          }

        );


      const text =
        await res.text();


      return json(
        JSON.parse(text)
      );


    }catch(error){


      return json({

        success:false,

        message:error.message

      },500);


    }

  }


  return json({

    success:false,

    message:"Method Not Allowed"

  },405);

}

// =========================
// LINE Webhook
// =========================
async function handleLineWebhook(request, env){

  if(request.method !== "POST"){
    return new Response("OK", {
      status:200
    });
  }


  const body = await request.json();

  console.log(
    "LINE EVENT",
    JSON.stringify(body)
  );


  if(
    body.events &&
    body.events.length > 0
  ){

    const event = body.events[0];


    if(event.source?.userId){

      console.log(
        "USER ID =",
        event.source.userId
      );

    }

  }


  // LINEへ必ず200を返す
  return new Response("OK",{
    status:200
  });

}

// =========================
// 売上CSV取得
// =========================
async function handleSalesCSV(request, env){

  // =========================
  // 認証
  // =========================

  const admin =
    await requireAdmin(
      request,
      env
    );


  if(!admin){

    return json({

      success:false,

      message:"Unauthorized"

    },401);

  }


  const body =
    await request.json();



  const res =
    await fetch(
      env.GAS_URL,
      {

        method:"POST",

        headers:{
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({

            mode:
              "getSalesCSV",

            startDate:
              body.startDate || "",

            endDate:
              body.endDate || ""

          })

      }
    );



  const text =
    await res.text();



  return new Response(
    text,
    {

      headers:{

        "Content-Type":
          "application/json",

        ...corsHeaders()

      }

    }
  );


}

// =========================
// キッチンカー注文番号生成
// KYYYYMMDD-001
// =========================
async function createKitchenOrderNo(env){

  const now =
    new Date()
      .toLocaleString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo"
        }
      );


  const ymd =
    new Date()
      .toLocaleDateString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo",
          year:"numeric",
          month:"2-digit",
          day:"2-digit"
        }
      )
      .replaceAll("/","");


  const prefix =
    "K" + ymd;


  const result =
    await env.DB
      .prepare(`
        SELECT COUNT(*) AS cnt
        FROM kitchen_orders
        WHERE order_no LIKE ?
      `)
      .bind(prefix + "%")
      .first();


  const serial =
    String(
      Number(result.cnt || 0) + 1
    )
    .padStart(3,"0");


  return prefix + "-" + serial;

}

// =========================
// キッチンカー注文登録
// =========================
async function handleKitchenOrder(request, env){

  if(request.method !== "POST"){

    return json(
      {
        success:false,
        message:"Method Not Allowed"
      },
      405
    );

  }


  let body;

  try{

    body =
      await request.json();

  }catch{

    return json(
      {
        success:false,
        message:"Invalid JSON"
      },
      400
    );

  }


  const {

    carNumber = "",
    paymentStatus = "受付",
    orders = []

  } = body;



  if(
    !Array.isArray(orders) ||
    orders.length === 0
  ){

    return json(
      {
        success:false,
        message:"商品がありません"
      },
      400
    );

  }



  // =========================
  // 注文番号
  // =========================
  const orderNo =
    await createKitchenOrderNo(env);



  const orderDate =
    new Date()
      .toLocaleString(
        "ja-JP",
        {
          timeZone:"Asia/Tokyo"
        }
      );



  const payment =
    paymentStatus === "会計済"
    ?
    "会計済"
    :
    "未";



  // =========================
  // D1保存
  // =========================
  for(const item of orders){


    await env.DB
      .prepare(`
        INSERT INTO kitchen_orders
        (
          order_no,
          order_date,
          vehicle_no,
          item_name,
          quantity,
          unit_price,
          amount,
          payment,
          status
        )
        VALUES
        (?,?,?,?,?,?,?,?,?)
      `)
      .bind(

        orderNo,
        orderDate,
        carNumber,
        item.productName || "",
        Number(item.qty || 0),
        Number(item.price || 0),
        Number(item.amount || 0),
        payment,
        "未"

      )
      .run();


  }



  return json({

    success:true,

    orderNo

  });


}

// =========================
// キッチンカー注文登録
// =========================
function addKitchenOrder(data){

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(
        "kitchen_orders"
      );

  if(!sheet){

    return output({

      success:false,

      message:
      "kitchen_ordersシートがありません"

    });

  }

  const now =
    new Date();

  const orderNo =
    createKitchenOrderNo();

  const carNumber =
    data.carNumber || "";

  // =========================
  // 会計状態
  // =========================
  const status =
    data.paymentStatus === "会計済"
    ?
    "会計済"
    :
    "受付";

  const orders =
    data.orders || [];

  orders.forEach(item=>{

    sheet.appendRow([

      orderNo,
      now,
      carNumber,
      item.productName || "",
      Number(item.qty || 0),
      Number(item.price || 0),
      Number(item.amount || 0),

      status,   // H 会計状態

      "未"      // I 状態

    ]);


    // =========================
    // 会計済なら売上履歴へ登録
    // =========================
    if(status === "会計済"){

      addSalesHistory({

        date: now,

        type: "キッチンカー",

        name: item.productName,

        qty: Number(item.qty || 0),

        price: Number(item.price || 0),

        amount: Number(item.amount || 0),

        orderNo: orderNo,

        sourceId:
          orderNo + "_" + sheet.getLastRow()

      });

    }

  });


  return output({

    success:true,

    orderNo,

    message:
    "注文受付しました"

  });

}

// =========================
// キッチンカー未会計取得
// =========================
async function handleKitchenUnpaid(
  request,
  env
){

  try{

    const result =
      await env.DB
        .prepare(`
          SELECT *
          FROM kitchen_orders
          WHERE payment != '会計済'
          ORDER BY id DESC
        `)
        .all();


    return json(
      result.results || []
    );


  }catch(e){

    console.error(
      "handleKitchenUnpaid error",
      e
    );


    return json(
      {
        success:false,
        message:e.message
      },
      500
    );

  }

}

// =========================
// キッチンカー会計済変更
// =========================
async function handleKitchenPaid(
  request,
  env
){

  if(request.method !== "POST"){

    return json({

      success:false,
      message:"Method Error"

    },405);

  }


  const body =
    await request.json();


  if(!body.orderNo){

    return json({

      success:false,
      message:"Missing orderNo"

    },400);

  }


  try{


    await env.DB
    .prepare(`
      UPDATE kitchen_orders
      SET payment='会計済'
      WHERE order_no=?
    `)
    .bind(
      body.orderNo
    )
    .run();



    return json({

      success:true

    });


  }catch(e){

    console.error(
      e
    );


    return json({

      success:false,

      message:e.message

    },500);

  }

}

// =========================
// キッチンカー売上取得
// =========================
async function handleKitchenSales(
request,
env
){


const admin =
await requireAdmin(
request,
env
);


if(!admin){

return json({

success:false,

message:"Unauthorized"

},401);

}


if(request.method !== "POST"){

return json({

success:false,

message:"Method Error"

},405);

}



const body =
await request.json();



try{


const result =
await env.DB
.prepare(`
SELECT
 order_date,
 order_no,
 item_name,
 quantity,
 unit_price,
 amount
FROM kitchen_orders
WHERE payment='会計済'
AND order_date >= ?
AND order_date <= ?
ORDER BY order_date DESC
`)
.bind(

body.startDate || "",

body.endDate || ""

)
.all();



return json({

success:true,

sales:
result.results || []

});


}catch(e){


console.error(
"handleKitchenSales Error",
e
);


return json({

success:false,

message:e.message

},500);


}

}

// =========================
// レシピ管理
// =========================
async function handleRecipes(request, env){

  const url =
    new URL(request.url);

  // =========================
  // レシピ一覧
  // =========================
  if(

    request.method === "GET" &&
    url.pathname === "/api/recipes"

  ){

    const res =
      await fetch(

        env.GAS_URL +
        "?mode=getRecipes"

      );

    return json(
      await res.json()
    );

  }

  // =========================
  // レシピ取得
  // =========================
  if(

    request.method === "GET" &&
    url.pathname === "/api/recipe"

  ){

    const productId =
      url.searchParams.get(
        "productId"
      );

    const res =
      await fetch(

        env.GAS_URL +

        "?mode=getRecipe" +

        "&productId=" +

        encodeURIComponent(
          productId
        )

      );

    return json(
      await res.json()
    );

  }

  // =========================
  // レシピ保存
  // =========================
  if(

    request.method === "POST" &&
    url.pathname === "/api/recipe/save"

  ){

    // 管理者認証
    const admin =
      await requireAdmin(
        request,
        env
      );

    if(!admin){

      return json({

        success:false,

        message:"Unauthorized"

      },401);

    }

    const body =
      await request.json();

    const res =
      await fetch(

        env.GAS_URL,

        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            mode:"saveRecipe",

            ...body

          })

        }

      );

    return json(
      await res.json()
    );

  }

  return json({

    error:"recipes route error"

  },404);

}

// =========================
// 売上一覧取得
// =========================
async function handleSalesList(request, env){

  const admin =
    await requireAdmin(request, env);

  if(!admin){
    return json({
      success:false,
      message:"Unauthorized"
    },401);
  }

  if(request.method !== "POST"){
    return json({
      success:false,
      message:"Method Not Allowed"
    },405);
  }

  const body =
    await request.json();

  const res =
    await fetch(env.GAS_URL,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        mode:"salesList",

        startDate:body.startDate,

        endDate:body.endDate,

        orderNo:body.orderNo

      })

    });

  const text =
    await res.text();

  return new Response(text,{
    headers:{
      "Content-Type":"application/json",
      ...corsHeaders()
    }
  });

}


// =========================
// 売上取消
// =========================
async function handleSalesCancel(request, env){

  const admin =
    await requireAdmin(request, env);

  if(!admin){

    return json({
      success:false,
      message:"Unauthorized"
    },401);

  }

  if(request.method !== "POST"){

    return json({
      success:false,
      message:"Method Not Allowed"
    },405);

  }

  const body =
    await request.json();

  const res =
    await fetch(env.GAS_URL,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        mode:"salesCancel",

        type:body.type,

        orderNo:body.orderNo,

        reason:body.reason

      })

    });

  const text =
    await res.text();

  return new Response(text,{
    headers:{
      "Content-Type":"application/json",
      ...corsHeaders()
    }
  });

}


// =========================
// キッチンカー注文キャンセル
// =========================
async function handleKitchenCancel(request, env){

  const admin =
    await requireAdmin(request, env);

  if(!admin){
    return json({
      success:false,
      message:"Unauthorized"
    },401);
  }

  if(request.method !== "POST"){
    return json({
      success:false,
      message:"Method Not Allowed"
    },405);
  }

  const body =
    await request.json();

  const res =
    await fetch(env.GAS_URL,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        mode:"kitchenCancel",

        orderNo:body.orderNo

      })

    });

  const text =
    await res.text();

  return new Response(text,{
    headers:{
      "Content-Type":"application/json",
      ...corsHeaders()
    }
  });

}

// =========================
// 売上詳細取得
// =========================
async function handleSalesDetail(request, env){

    // -------------------------
    // POSTのみ
    // -------------------------
    if(request.method !== "POST"){

        return json(
            {
                success:false,
                message:"Method Not Allowed"
            },
            405
        );

    }

    // -------------------------
    // 管理者認証
    // -------------------------
    const admin =
        await requireAdmin(request, env);

    if(!admin){

        return json(
            {
                success:false,
                message:"Unauthorized"
            },
            401
        );

    }

    // -------------------------
    // リクエスト取得
    // -------------------------
    let body;

    try{

        body =
            await request.json();

    }
    catch{

        return json(
            {
                success:false,
                message:"Invalid JSON"
            },
            400
        );

    }

    const {
        type,
        orderNo
    } = body;

    if(!type || !orderNo){

        return json(
            {
                success:false,
                message:"Missing parameters"
            },
            400
        );

    }

    // -------------------------
    // GASへ転送
    // -------------------------
    try{

        const gasRes =
            await fetch(
                env.GAS_URL,
                {
                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify({

                        mode:"getSalesDetail",

                        type,

                        orderNo

                    })

                }
            );

        if(!gasRes.ok){

            return json(
                {
                    success:false,
                    message:"GAS Error"
                },
                gasRes.status
            );

        }

        const result =
            await gasRes.json();

        return json(result);

    }
    catch(err){

        console.error(
            "handleSalesDetail Error",
            err
        );

        return json(
            {
                success:false,
                message:"Internal Server Error",
                error:String(err)
            },
            500
        );

    }

}
