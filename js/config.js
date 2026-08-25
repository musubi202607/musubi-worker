// =========================
// API
// =========================
const API_URL =
  "https://musubi-next.musubi-202607.workers.dev";


// =========================
// Cloudinary
// =========================
const CLOUDINARY = {

  cloudName:
    "i5pbmztl",

  uploadPreset:
    "products_upload"

};


// =========================
// Session
// =========================
let SESSION_ID =
  localStorage.getItem(
    "sessionId"
  );

if(!SESSION_ID){

  SESSION_ID =
    crypto.randomUUID();

  localStorage.setItem(
    "sessionId",
    SESSION_ID
  );

}
