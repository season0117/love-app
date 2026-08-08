// 自动部署云函数到CloudBase
const { execSync } = require('child_process')

const ENV = 'love-app-d3gezf6lf27ee3d6e'

try {
  // 先用 fn code update 直接更新代码（不需要交互）
  console.log('更新云函数代码...')
  execSync(`npx tcb fn code update api -e ${ENV}`, {
    stdio: 'inherit',
    cwd: __dirname
  })
  console.log('部署完成!')
} catch(e) {
  console.log('尝试直接部署...')
  execSync(`npx tcb fn deploy api -e ${ENV} --mode code`, {
    stdio: 'inherit',
    cwd: __dirname
  })
}
