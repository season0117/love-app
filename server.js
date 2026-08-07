const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 4000
const BASE = path.join(__dirname, 'dist', 'build', 'h5')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
}

http.createServer((req, res) => {
  let filePath = path.join(BASE, req.url === '/' ? '/index.html' : req.url.split('?')[0])
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(BASE, 'index.html'), (err2, data2) => {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        })
        res.end(data2)
      })
    } else {
      const ext = path.extname(filePath)
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      })
      res.end(data)
    }
  })
}).listen(PORT, () => {
  console.log('Server: http://localhost:' + PORT)
})
