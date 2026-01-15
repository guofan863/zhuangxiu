const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/bmp': true,
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'video/mp4': true,
    'video/avi': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB 限制
  }
});

// 应用认证中间件
router.use(authMiddleware.protect);

// 单文件上传
router.post('/single', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: '请选择文件' });
    }

    // 构建文件URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
      status: 'success',
      message: '文件上传成功',
      data: {
        filename: req.file.filename,
        url: fileUrl,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '文件上传失败', error: error.message });
  }
});

// 多文件上传
router.post('/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'error', message: '请选择文件' });
    }

    // 处理上传的文件
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      status: 'success',
      message: '文件上传成功',
      data: files
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '文件上传失败', error: error.message });
  }
});

// 删除文件
router.delete('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      // 删除文件
      fs.unlinkSync(filePath);
      res.status(200).json({ status: 'success', message: '文件删除成功' });
    } else {
      res.status(404).json({ status: 'error', message: '文件不存在' });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: '文件删除失败', error: error.message });
  }
});

module.exports = router;