const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, '../public/uploads');
      cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
      const fileExt = path.extname(file.originalname);
      const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 100000)}${fileExt}`;
      cb(null, uniqueName);
    }
  })

  const upload = multer({storage})

  module.exports = { upload }