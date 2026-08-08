const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 8080
const DATA_DIR = path.join(__dirname, 'data')
const DB = path.join(DATA_DIR, 'state.json')

// 初始化数据文件
if (!fs.existsSync(DB)) {
  fs.writeFileSync(DB, JSON.stringify({
    loveDate: '',
    anniversary: { name: '一周年纪念日', date: '' },
    answers: {},
    missMessages: [],
    storyHistory: []
  }, null, 2))
}

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf-8')) }
  catch(e) { return {} }
}

function writeDB(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2))
}

function sendJSON(res, data, code = 200) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      try { resolve(JSON.parse(body)) }
      catch(e) { resolve({}) }
    })
  })
}

// 路由处理
async function handleAPI(req, res, pathname) {
  // 获取全部状态
  if (pathname === '/api/state' && req.method === 'GET') {
    return sendJSON(res, readDB())
  }

  // 恋爱日期
  if (pathname === '/api/love-date' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    db.loveDate = body.date || ''
    writeDB(db)
    return sendJSON(res, db.loveDate)
  }

  // 纪念日
  if (pathname === '/api/anniversary' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    db.anniversary = { name: body.name || '', date: body.date || '' }
    writeDB(db)
    return sendJSON(res, db.anniversary)
  }

  // 每日回答
  if (pathname === '/api/daily-answer' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    db.answers[body.dateKey] = body.answer
    writeDB(db)
    return sendJSON(res, db.answers)
  }

  // 发送思念
  if (pathname === '/api/miss-send' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    db.missMessages.unshift({
      text: body.text,
      time: new Date().toLocaleString('zh-CN'),
      emoji: body.emoji || '💌'
    })
    if (db.missMessages.length > 50) db.missMessages = db.missMessages.slice(0, 50)
    writeDB(db)
    return sendJSON(res, db.missMessages)
  }

  // 获取思念消息
  if (pathname === '/api/miss-messages' && req.method === 'GET') {
    return sendJSON(res, readDB().missMessages || [])
  }

  // 故事历史
  if (pathname === '/api/story-history' && req.method === 'GET') {
    return sendJSON(res, readDB().storyHistory || [])
  }

  if (pathname === '/api/story-add' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    const exists = db.storyHistory.find(s => s.dateKey === body.dateKey)
    if (!exists) {
      db.storyHistory.unshift(body)
      if (db.storyHistory.length > 30) db.storyHistory = db.storyHistory.slice(0, 30)
      writeDB(db)
    }
    return sendJSON(res, db.storyHistory)
  }

  if (pathname === '/api/story-like' && req.method === 'POST') {
    const body = await parseBody(req)
    const db = readDB()
    const s = db.storyHistory.find(s => s.dateKey === body.dateKey)
    if (s) { s.liked = body.liked; writeDB(db) }
    return sendJSON(res, db.storyHistory)
  }

  // 404
  sendJSON(res, { error: 'Not found' }, 404)
}

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return res.end()
  }

  if (pathname.startsWith('/api/')) {
    return handleAPI(req, res, pathname)
  }

  // 静态文件 - 返回 H5 构建结果
  const h5Dir = path.join(__dirname, '..', 'dist', 'build', 'h5')
  let filePath = path.join(h5Dir, pathname === '/' ? 'index.html' : pathname)
  const ext = path.extname(filePath)

  const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      fs.readFile(path.join(h5Dir, 'index.html'), (e2, d2) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(d2)
      })
    } else {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(data)
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log('Server ready on port ' + PORT)
  console.log('API: http://localhost:' + PORT + '/api/state')
})
