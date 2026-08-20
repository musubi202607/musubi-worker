// =========================
// Cloudinary 共通
// =========================


// =========================
// 画像縮小
// =========================
async function resizeImage(file){

  return new Promise((resolve)=>{

    const img =
      new Image();


    const reader =
      new FileReader();


    reader.onload = e=>{


      img.onload = ()=>{


        const MAX = 1200;


        let width =
          img.width;


        let height =
          img.height;



        if(width > height){


          if(width > MAX){


            height =
              height * MAX / width;


            width =
              MAX;


          }


        }else{


          if(height > MAX){


            width =
              width * MAX / height;


            height =
              MAX;


          }


        }



        const canvas =
          document.createElement(
            "canvas"
          );


        canvas.width =
          width;


        canvas.height =
          height;



        const ctx =
          canvas.getContext(
            "2d"
          );



        ctx.drawImage(

          img,

          0,

          0,

          width,

          height

        );



        canvas.toBlob(


          blob=>{


            resolve(

              new File(

                [blob],

                file.name,

                {

                  type:
                    "image/jpeg"

                }

              )

            );


          },


          "image/jpeg",


          0.85


        );


      };



      img.src =
        e.target.result;


    };



    reader.readAsDataURL(file);


  });


}



// =========================
// Cloudinary Upload
// =========================
async function uploadImage({

  fileInputId,

  urlInputId,

  previewId

}){


  const fileInput =
    document.getElementById(
      fileInputId
    );



  if(!fileInput){

    throw new Error(
      "file input not found"
    );

  }



  const file =
    fileInput.files[0];



  if(!file){

    return;

  }



  try{


    // -------------------------
    // 画像縮小
    // -------------------------
    const resized =
      await resizeImage(file);



    const formData =
      new FormData();



    formData.append(

      "file",

      resized

    );



    formData.append(

      "upload_preset",

      CLOUDINARY.uploadPreset

    );



    // -------------------------
    // Cloudinary Upload
    // -------------------------
    const response =
      await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/image/upload`,

        {

          method:"POST",

          body:formData

        }

      );



    const data =
      await response.json();



    console.log(

      "Cloudinary result",

      data

    );



    if(!data.secure_url){


      throw new Error(

        "Cloudinary upload failed"

      );


    }



    // -------------------------
    // URLセット
    // -------------------------
    const urlInput =
      document.getElementById(
        urlInputId
      );



    if(urlInput){

      urlInput.value =
        data.secure_url;

    }



    // -------------------------
    // Preview
    // -------------------------
    const preview =
      document.getElementById(
        previewId
      );



    if(preview){


      preview.src =
        data.secure_url;



      preview.style.display =
        "block";


    }



  }catch(error){


    console.error(

      "uploadImage error",

      error

    );


    throw error;


  }


}