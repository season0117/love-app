<template>
  <view class="miss-page">
    <!-- 顶部温馨区域 -->
    <view class="main-action">
      <view class="heart-area">
        <view class="heart-ring" :class="{ active: isSending }"></view>
        <view class="heart-btn" @tap="sendMissYou" :class="{ sent: lastSent }">
          <text class="heart-emoji">💗</text>
          <text class="heart-text">{{ lastSent ? '已发送' : '想你了' }}</text>
          <text class="heart-sub">点击发送思念</text>
        </view>
      </view>
      <view class="send-status" v-if="lastSent">
        <text class="status-text">💌 最近发送：{{ lastSentFormatted }}</text>
      </view>
    </view>

    <!-- 快捷思念语 -->
    <view class="card quick-msgs">
      <text class="card-title">💌 快捷思念语</text>
      <view class="msg-grid">
        <view 
          v-for="(msg, idx) in quickMessages" 
          :key="idx"
          class="msg-item"
          @tap="sendCustomMsg(msg)"
        >
          <text class="msg-emoji">{{ msg.emoji }}</text>
          <text class="msg-text">{{ msg.text }}</text>
        </view>
      </view>
    </view>

    <!-- 自定义消息 -->
    <view class="card custom-card">
      <text class="card-title">✏️ 写一句话给TA</text>
      <textarea 
        class="custom-input"
        v-model="customMsg"
        placeholder="写下你想对TA说的话..."
        maxlength="200"
      />
      <button class="btn-primary" @tap="sendCustomMsg({ emoji: '💌', text: customMsg })">
        发送思念 💕
      </button>
    </view>

    <!-- 发送记录 -->
    <view class="card history-card">
      <text class="card-title">📬 思念记录</text>
      <view v-if="sendHistory.length > 0" class="history-list">
        <view v-for="(item, idx) in sendHistory" :key="idx" class="history-row">
          <text class="h-emoji">{{ item.emoji }}</text>
          <text class="h-text">{{ item.text }}</text>
          <text class="h-time">{{ item.time }}</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-emoji">💝</text>
        <text class="empty-text">还没发送过思念哦</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMissMessages, sendMiss } from '@/utils/api.js'

const isSending = ref(false)
const lastSent = ref('')
const customMsg = ref('')
const sendHistory = ref([])

const quickMessages = [
  { emoji: '🥰', text: '好想你呀' },
  { emoji: '😘', text: '亲亲' },
  { emoji: '🤗', text: '好想抱抱你' },
  { emoji: '💕', text: '爱你想你' },
  { emoji: '🌙', text: '晚安亲爱的' },
  { emoji: '☀️', text: '早安宝贝' },
  { emoji: '💭', text: '梦里见' },
  { emoji: '❤️', text: '超级爱你' },
]

const lastSentFormatted = ref('')

onMounted(() => {
  loadHistory()
})

async function loadHistory() {
  try {
    const msgs = await getMissMessages()
    sendHistory.value = msgs || []
  } catch(e) {}
}

async function sendMissYou() {
  if (isSending.value) return
  
  isSending.value = true
  
  setTimeout(async () => {
    isSending.value = false
    const now = new Date()
    lastSent.value = now.toISOString()
    lastSentFormatted.value = (now.getMonth()+1) + '月' + now.getDate() + '日 ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0')
    
    const record = {
      emoji: '💗',
      text: '想你了',
      time: lastSentFormatted.value,
    }
    sendHistory.value.unshift(record)
    await sendMiss('想你了', '💗')
    
    try { uni.vibrateShort() } catch(e) {}
    setTimeout(() => { lastSent.value = '' }, 3000)
  }, 800)
}

async function sendCustomMsg(msg) {
  if (!msg.text || !msg.text.trim()) {
    uni.showToast({ title: '写点什么吧~', icon: 'none' })
    return
  }
  
  const now = new Date()
  const timeStr = (now.getMonth()+1) + '月' + now.getDate() + '日 ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2,'0')
  
  const record = {
    emoji: msg.emoji || '💌',
    text: msg.text.trim(),
    time: timeStr,
  }
  
  sendHistory.value.unshift(record)
  await sendMiss(msg.text.trim(), msg.emoji || '💌')
  
  customMsg.value = ''
  try { uni.vibrateShort() } catch(e) {}
  uni.showToast({ title: '思念已送达 💌', icon: 'none' })
}
</script>

<style scoped>
.miss-page {
  min-height: 100vh;
  padding-bottom: 30rpx;
}

.main-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 30rpx;
}

.heart-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.heart-ring {
  position: absolute;
  width: 260rpx;
  height: 260rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 107, 138, 0.15);
}

.heart-ring.active {
  animation: ringPulse 0.8s ease-out;
  border-color: rgba(255, 107, 138, 0.5);
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.heart-btn {
  width: 220rpx;
  height: 220rpx;
  background: linear-gradient(135deg, #FF6B8A, #FF4081);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 40rpx rgba(255, 64, 129, 0.4);
  cursor: pointer;
  transition: transform 0.2s;
}

.heart-btn:active {
  transform: scale(0.9);
}

.heart-btn.sent {
  background: linear-gradient(135deg, #FFB3C1, #FF8FA3);
}

.heart-emoji {
  font-size: 56rpx;
  animation: heartbeat 1.2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(1); }
  75% { transform: scale(1.2); }
}

.heart-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.heart-sub {
  font-size: 20rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 4rpx;
}

.send-status {
  margin-top: 20rpx;
}

.status-text {
  font-size: 26rpx;
  color: #FF6B8A;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.08);
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.msg-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.msg-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: #FFF5F7;
  border-radius: 30rpx;
  transition: transform 0.15s;
}

.msg-item:active {
  transform: scale(0.95);
  background: #FFE4E9;
}

.msg-emoji {
  font-size: 30rpx;
}

.msg-text {
  font-size: 26rpx;
  color: #FF6B8A;
}

.custom-input {
  width: 100%;
  height: 180rpx;
  background: #FFF5F7;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  color: #333;
  margin-bottom: 20rpx;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #FF6B8A, #FF8FA3);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 22rpx 0;
  font-size: 30rpx;
  font-weight: bold;
}

.history-row {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #FFF0F3;
}

.history-row:last-child {
  border: none;
}

.h-emoji {
  font-size: 30rpx;
  margin-right: 12rpx;
}

.h-text {
  flex: 1;
  font-size: 28rpx;
  color: #555;
}

.h-time {
  font-size: 22rpx;
  color: #bbb;
}

.empty-state {
  text-align: center;
  padding: 40rpx 0;
}

.empty-emoji {
  font-size: 50rpx;
  display: block;
  margin-bottom: 10rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #bbb;
}
</style>
