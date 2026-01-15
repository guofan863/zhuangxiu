const { Note } = require('../config/database');

// 创建随手记
exports.createNote = async (req, res) => {
  try {
    const user = req.user;
    const {
      title,
      content,
      category,
      priority,
      status
    } = req.body;
    
    // 创建随手记
    const note = await Note.create({
      userId: user.id,
      title,
      content,
      category,
      priority: priority || 'normal',
      status: status || 'active'
    });
    
    res.status(201).json({
      status: 'success',
      message: '随手记创建成功',
      data: note
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ status: 'error', message: '随手记创建失败' });
  }
};

// 获取随手记列表
exports.getNotes = async (req, res) => {
  try {
    const user = req.user;
    
    // 获取用户的所有随手记
    const notes = await Note.findAll({ where: { userId: user.id }, order: [['createdAt', 'DESC']] });
    
    res.status(200).json({
      status: 'success',
      data: notes
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ status: 'error', message: '获取随手记列表失败' });
  }
};

// 获取随手记详情
exports.getNoteById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取随手记
    const note = await Note.findOne({ where: { id, userId: user.id } });
    
    if (!note) {
      return res.status(404).json({ status: 'error', message: '随手记不存在' });
    }
    
    res.status(200).json({
      status: 'success',
      data: note
    });
  } catch (error) {
    console.error('Get note by id error:', error);
    res.status(500).json({ status: 'error', message: '获取随手记详情失败' });
  }
};

// 更新随手记
exports.updateNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const {
      title,
      content,
      category,
      priority,
      status
    } = req.body;
    
    // 获取随手记
    const note = await Note.findOne({ where: { id, userId: user.id } });
    
    if (!note) {
      return res.status(404).json({ status: 'error', message: '随手记不存在' });
    }
    
    // 更新随手记
    await note.update({
      title: title || note.title,
      content: content || note.content,
      category: category !== undefined ? category : note.category,
      priority: priority !== undefined ? priority : note.priority,
      status: status !== undefined ? status : note.status
    });
    
    res.status(200).json({
      status: 'success',
      message: '随手记更新成功',
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ status: 'error', message: '随手记更新失败' });
  }
};

// 删除随手记
exports.deleteNote = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    
    // 获取随手记
    const note = await Note.findOne({ where: { id, userId: user.id } });
    
    if (!note) {
      return res.status(404).json({ status: 'error', message: '随手记不存在' });
    }
    
    // 删除随手记
    await note.destroy();
    
    res.status(200).json({
      status: 'success',
      message: '随手记删除成功'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ status: 'error', message: '随手记删除失败' });
  }
};