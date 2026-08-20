export default {
  async fetch(request, env, ctx) {

    return new Response(
      "musubi-next Worker test OK",
      {
        headers: {
          "content-type": "text/plain;charset=UTF-8"
        }
      }
    );

  }
};
