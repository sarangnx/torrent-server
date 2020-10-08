const multer = require('multer');

/**
 * Multer with memory store as storage engine.
 * Uploaded files are stored in memory,
 * as soon as the request is completed it is freed.
 */
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports.upload = upload;
