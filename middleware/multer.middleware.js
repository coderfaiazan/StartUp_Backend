import path from "path";

import multer from "multer";

const upload = multer({
  dest: "uploads/",//file uploads path me upload hogi
  //limits aapko max limit degi ki kitne limit tak ki file upload kar sakte hain
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
  storage: multer.diskStorage({//storage bta rha ki yeh kahan store hone wala hai
    destination: "uploads/",//uploads me store hone wala hai
    filename: (_req, file, cb) => {
      cb(null, file.originalname);//jis filename se uploads kiya hai usi file se upload hoga
    },
  }),
  //cb->callback
  fileFilter: (_req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".jpg" &&//file filter lga diye hain ki kaun kaun si file hum access lar sakte hain .jpg and webp etc access kar sakte hai
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4"
    ) {
      cb(new Error(`Unsupported file type! ${ext}`), false);
      return;
    }

    cb(null, true);
  },
});
export default upload;
// support@pwskills.com