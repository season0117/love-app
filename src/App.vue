<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
onLaunch(() => {
  console.log('💕 恋爱记 App 启动')
})
onShow(() => {
  console.log('💕 App 显示')
})
onHide(() => {
  console.log('💕 App 隐藏')
})
</script>

<style>
/* 全局样式 */
page {
  background-color: #FFF5F7;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 通用卡片样式 */
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.1);
}

/* 通用按钮 */
.btn-primary {
  background: linear-gradient(135deg, #FF6B8A, #FF8FA3);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 60rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 138, 0.3);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

/* 粉红渐变文字 */
.gradient-text {
  background: linear-gradient(135deg, #FF6B8A, #FF4081);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
