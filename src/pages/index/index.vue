<template>
  <view class="home-page">
    <!-- 顶部情侣信息卡片 -->
    <view class="couple-card">
      <view class="hearts-bg">💕 💕 💕</view>
      <view class="couple-avatars">
        <view class="avatar-wrap">
          <view class="avatar">🧑‍🤝‍🧑</view>
          <text class="name">我</text>
        </view>
        <view class="love-icon">💖</view>
        <view class="avatar-wrap">
          <view class="avatar">👩‍❤️‍👨</view>
          <text class="name">TA</text>
        </view>
      </view>
      <text class="couple-title">我们在一起</text>
      <text class="love-days">{{ loveDays }}</text>
      <text class="days-label">天</text>
      <view class="date-range" @tap="showDatePicker = true">
        <text>{{ startDate }}</text>
        <text class="edit-hint"> 📅 设置日期</text>
      </view>
    </view>

    <!-- 纪念日倒数 -->
    <view class="card countdown-card">
      <text class="card-title">🎯 下一个纪念日</text>
      <view class="countdown-box" @tap="showAnniversaryPicker = true">
        <text class="anniversary-name">{{ anniversaryName }}</text>
        <view class="countdown-days">
          <text class="countdown-num">{{ countdownDays }}</text>
          <text class="countdown-unit">天</text>
        </view>
        <text class="edit-hint">📅 点击设置纪念日</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-actions">
      <view class="action-item" @tap="goMiss">
        <view class="action-icon">💌</view>
        <text class="action-text">想你了</text>
      </view>
      <view class="action-item" @tap="goDaily">
        <view class="action-icon">💭</view>
        <text class="action-text">每日一问</text>
      </view>
      <view class="action-item" @tap="goStory">
        <view class="action-icon">🌙</view>
        <text class="action-text">睡前故事</text>
      </view>
    </view>

    <!-- 日期选择弹窗 -->
    <view class="modal-mask" v-if="showDatePicker" @tap="showDatePicker = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">设置在一起的日期</text>
        <picker mode="date" :value="startPickerDate" @change="onStartDateChange">
          <view class="picker-btn">{{ startDate || '选择日期' }}</view>
        </picker>
        <button class="btn-primary" @tap="showDatePicker = false">确定</button>
      </view>
    </view>

    <!-- 纪念日设置弹窗 -->
    <view class="modal-mask" v-if="showAnniversaryPicker" @tap="showAnniversaryPicker = false">
      <view class="modal-content" @tap.stop>
        <text class="modal-title">设置纪念日</text>
        <input class="input" v-model="anniversaryName" placeholder="纪念日名称（如：一周年）" />
        <picker mode="date" :value="anniversaryDate" @change="onAnniversaryChange">
          <view class="picker-btn">{{ anniversaryDate || '选择日期' }}</view>
        </picker>
        <button class="btn-primary" @tap="onSaveAnniversary">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getState, saveLoveDate, saveAnniversary } from '@/utils/api.js'

// 状态
const startDate = ref('')
const loveDays = ref(0)
const showDatePicker = ref(false)
const showAnniversaryPicker = ref(false)
const anniversaryName = ref('一周年纪念日')
const anniversaryDate = ref('')
const countdownDays = ref(0)

onMounted(() => {
  loadData()
})

async function loadData() {
  try {
    const state = await getState()
    if (state.loveDate) {
      startDate.value = state.loveDate
      calcLoveDays()
    } else {
      startDate.value = '2026-01-01'
      calcLoveDays()
    }
    if (state.anniversary) {
      if (state.anniversary.name) anniversaryName.value = state.anniversary.name
      if (state.anniversary.date) anniversaryDate.value = state.anniversary.date
    }
    calcCountdown()
  } catch(e) {
    startDate.value = '2026-01-01'
    calcLoveDays()
  }
}

function calcLoveDays() {
  if (!startDate.value) return
  const start = new Date(startDate.value.replace(/-/g, '/'))
  const now = new Date()
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24))
  loveDays.value = Math.max(0, diff)
}

function calcCountdown() {
  if (!anniversaryDate.value) {
    countdownDays.value = 0
    return
  }
  const target = new Date(anniversaryDate.value.replace(/-/g, '/'))
  const now = new Date()
  if (target < now) {
    target.setFullYear(target.getFullYear() + 1)
  }
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  countdownDays.value = Math.max(0, diff)
}

async function onStartDateChange(e) {
  startDate.value = e.detail.value
  await saveLoveDate(startDate.value)
  calcLoveDays()
}

function onAnniversaryChange(e) {
  anniversaryDate.value = e.detail.value
}

async function onSaveAnniversary() {
  await saveAnniversary(anniversaryName.value, anniversaryDate.value)
  calcCountdown()
  showAnniversaryPicker.value = false
  uni.showToast({ title: '纪念日已保存 💕', icon: 'none' })
}

const startPickerDate = computed(() => startDate.value || '2026-01-01')

function goMiss() {
  uni.switchTab({ url: '/pages/miss/miss' })
}
function goDaily() {
  uni.switchTab({ url: '/pages/daily/daily' })
}
function goStory() {
  uni.switchTab({ url: '/pages/story/story' })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 20rpx;
}

/* 情侣卡片 */
.couple-card {
  background: linear-gradient(135deg, #FF6B8A, #FF8FA3);
  margin: 20rpx;
  border-radius: 30rpx;
  padding: 40rpx 30rpx;
  text-align: center;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(255, 107, 138, 0.35);
}

.hearts-bg {
  position: absolute;
  top: 10rpx;
  left: 10rpx;
  font-size: 24rpx;
  opacity: 0.2;
  letter-spacing: 20rpx;
}

.couple-avatars {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
  margin-bottom: 20rpx;
}

.avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  border: 3rpx solid rgba(255,255,255,0.4);
}

.name {
  font-size: 26rpx;
  margin-top: 10rpx;
  opacity: 0.9;
}

.love-icon {
  font-size: 40rpx;
  animation: heartbeat 1.2s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.25); }
  50% { transform: scale(1); }
  75% { transform: scale(1.25); }
}

.couple-title {
  font-size: 26rpx;
  opacity: 0.9;
  display: block;
  margin-top: 10rpx;
}

.love-days {
  font-size: 96rpx;
  font-weight: bold;
  display: inline;
  text-shadow: 0 4rpx 8rpx rgba(0,0,0,0.15);
}

.days-label {
  font-size: 32rpx;
  margin-left: 8rpx;
}

.date-range {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  opacity: 0.8;
  padding: 10rpx 20rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 30rpx;
  display: inline-block;
}

.edit-hint {
  font-size: 22rpx;
}

/* 倒数卡片 */
.countdown-card .card-title {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.1);
}

.countdown-box {
  text-align: center;
}

.anniversary-name {
  font-size: 30rpx;
  color: #FF6B8A;
  font-weight: bold;
}

.countdown-days {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-top: 16rpx;
}

.countdown-num {
  font-size: 72rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #FF6B8A, #FF4081);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.countdown-unit {
  font-size: 28rpx;
  color: #999;
  margin-left: 8rpx;
}

/* 快捷入口 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  margin: 10rpx 20rpx;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.08);
  width: 180rpx;
  transition: transform 0.2s;
}

.action-item:active {
  transform: scale(0.95);
}

.action-icon {
  font-size: 50rpx;
  margin-bottom: 12rpx;
}

.action-text {
  font-size: 26rpx;
  color: #666;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background: #fff;
  border-radius: 30rpx;
  padding: 40rpx;
  width: 600rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.picker-btn {
  padding: 20rpx 40rpx;
  background: #FFF5F7;
  border-radius: 20rpx;
  color: #FF6B8A;
  font-size: 28rpx;
  margin: 20rpx 0;
}

.input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #FFE4E9;
  border-radius: 16rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  text-align: center;
  color: #333;
}

.btn-primary {
  margin-top: 30rpx;
  width: 100%;
  background: linear-gradient(135deg, #FF6B8A, #FF8FA3);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 0;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
