export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {

      // =========================
      // 商品一覧
      // =========================
      if (path === "/api/products") {
        return json(await getProducts(env));
      }

      // =========================
      // 商品更新
      // =========================
      if (path === "/api/products/update") {
        const body = await request.json();
        return json(await updateProduct(env, body));
      }

      // =========================
      // 商品削除
      // =========================
      if (path === "/api/products/delete") {
        const body = await request.json();
        return json(await deleteProduct(env, body.id));
      }

      // =========================
      // カレンダー（予約用）
      // =========================
      if (path === "/api/calendar") {
        return json(await getCalendar(env));
      }

      // =========================
      // カレンダー管理
      // =========================
      if (path === "/api/calendar/admin") {
        return json(await getCalendarAdmin(env));
      }

      if (path === "/api/calendar/update") {
        const body = await request.json();
        return json(await updateCalendar(env, body));
      }

      // =========================
      // 予約一覧
      // =========================
      if (path === "/api/reservations") {
        return json(await getReservations(env));
      }

      // =========================
      // 予約詳細
      // =========================
      if (path.startsWith("/api/reservation/")) {
        const no = path.split("/").pop();
        return json(await getReservationDetail(env, no));
      }

      // =========================
      // 追加注文履歴
      // =========================
      if (path.startsWith("/api/orderhistory/")) {
        const no = path.split("/").pop();
        return json(await getOrderHistory(env, no));
      }

      // =========================
      // 未会計一覧
      // =========================
      if (path === "/api/unpaid") {
        return json(await getUnpaid(env));
      }

      // =========================
      // BBQ未会計
      // =========================
      if (path === "/api/bbq/unpaid") {
        return json(await getBbqUnpaid(env));
      }

      // =========================
      // おにぎり未会計
      // =========================
      if (path === "/api/onigiri/unpaid") {
        return json(await getOnigiriUnpaid(env));
      }

      // =========================
      // 会計待ち
      // =========================
      if (path === "/api/payments/waiting") {
        return json(await getWaitingPayments(env));
      }

      if (path === "/api/payments/paid") {
        const body = await request.json();
        return json(await setPaid(env, body.no));
      }

      // =========================
      // ダッシュボード
      // =========================
      if (path === "/api/dashboard") {
        return json(await getDashboard(env));
      }

      return json({ error: "Not Found" }, 404);

    } catch (e) {
      return json({ error: e.message }, 500);
    }
  }
};

// =========================
// utils
// =========================
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}