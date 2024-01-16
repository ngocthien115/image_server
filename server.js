// index.js
const express = require('express');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 5050;
const fs = require('fs')
const logger = require('./winston');
const morgan = require('morgan');
const date = new Date()
const imgPath = `uploads/${date.getFullYear()}/${date.getMonth() + 1}`

const loggingMiddleware = (req, res, next) => {
  
  logger.info(`${req.method} ${req.path} ${res.statusCode}`)
  next()
}

const array_of_allowed_files = ['png', 'jpeg', 'jpg', 'gif'];

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create folder if not exist
    const existPath = fs.existsSync(imgPath)
    if (!existPath) fs.mkdirSync(imgPath, { recursive: true });
    cb(null, imgPath);
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + '-' + file.originalname
    cb(null, fileName)
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000, // Limit 5MB file
  },
  fileFilter: function(_req, file, cb){
    checkFileType(file, cb);
  }
});

function checkFileType (file, cb) {
  // Get the extension of the uploaded file
  const file_extension = file.originalname.slice(
    ((file.originalname.lastIndexOf('.') - 1) >>> 0) + 2
  );

  // Check if the uploaded file is allowed
  if (!array_of_allowed_files.includes(file_extension)) {
    return cb(new Error('File type is invalid. Only accept image type png/jpg/jpeg/gif.'), false);
  }
  return cb(null, true);
}

app.use(loggingMiddleware)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
// ROUTE DEFINE
app.use('/uploads',express.static('uploads'))

const uploadSingleImage = upload.single('file')

app.post('/upload', function (req, res) {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      logger.info(err.message)
      return res.status(400).send({ message: err.message })
    }

    // Everything went fine.
    if (!req.file) {
      logger.info('No upload file found.')
      return res.status(400).json({ error: 'No upload file found.' });
    }
    logger.info(`File is uploaded to ${imgPath}/${req.file.filename}`)

    res.json({ 
      message: 'File uploaded successfully',
      image_url: `${req.protocol}://${req.get('Host')}/${imgPath}/${req.file.filename}`
    });
  })
})

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});