<template>
  <view class="daily-page">
    <!-- 今日问题卡片 -->
    <view class="card question-card">
      <view class="today-badge">📮 今日问题</view>
      <view class="question-icon">💭</view>
      <text class="question-text">{{ currentQuestion }}</text>
      <text class="question-date">{{ todayDate }}</text>
    </view>

    <!-- 我的回答 -->
    <view class="card answer-card">
      <text class="card-title">💬 我的回答</text>
      <text class="answer-label" v-if="myAnswer">已回答 ✅</text>
      <text class="answer-label pending" v-else>待回答...</text>
      <text class="answer-content" v-if="myAnswer">{{ myAnswer }}</text>
      <textarea 
        v-else
        class="answer-input" 
        v-model="answerText" 
        placeholder="写下你的心里话..."
        maxlength="500"
      />
      <button v-if="!myAnswer" class="btn-primary" @tap="submitAnswer">提交回答</button>
    </view>

    <!-- TA的回答 -->
    <view class="card answer-card">
      <text class="card-title">💕 TA的回答</text>
      <text class="answer-label" v-if="taAnswer">已回答 ✅</text>
      <text class="answer-label pending" v-else>对方还没回答~</text>
      <text class="answer-content" v-if="taAnswer">{{ taAnswer }}</text>
      <view v-else class="waiting-tip">
        <text class="waiting-emoji">🤫</text>
        <text class="waiting-text">等TA回答后就能看到啦~</text>
      </view>
    </view>

    <!-- 历史问答 -->
    <view class="card history-card">
      <text class="card-title">📋 往期问答</text>
      <view v-if="historyList.length > 0" class="history-list">
        <view v-for="(item, idx) in historyList" :key="idx" class="history-item">
          <text class="history-date">{{ item.date }}</text>
          <text class="history-q">{{ item.question }}</text>
          <text class="history-a">💬 {{ item.myAnswer || '未回答' }}</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-emoji">📝</text>
        <text class="empty-text">还没有历史记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getState, saveDailyAnswer } from '@/utils/api.js'

// 问题库
const questionBank = [
  '今天最想和TA一起做什么？',
  '第一次心动的瞬间是什么时候？',
  '你觉得TA最可爱的地方是什么？',
  '下次见面最想拥抱多久？',
  '用三个词形容TA在你心中的样子',
  '在一起最难忘的一个画面是什么？',
  '如果现在可以飞去TA身边，第一件事做什么？',
  'TA做过最让你感动的事是什么？',
  '你最喜欢TA的哪个小习惯？',
  '对未来的生活有什么期待？',
  '最近有没有什么事想和TA一起完成？',
  '觉得爱情里最重要的是什么？',
  '想对TA说但一直没说出口的话？',
  '你们之间最有默契的一件事？',
  '如果给TA一个惊喜，你会准备什么？',
]

const todayDate = ref('')
const currentQuestion = ref('')
const myAnswer = ref('')
const taAnswer = ref('')
const answerText = ref('')
const historyList = ref([])

onMounted(() => {
  loadTodayQuestion()
})

async function loadTodayQuestion() {
  const now = new Date()
  todayDate.value = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日'
  
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const idx = seed % questionBank.length
  currentQuestion.value = questionBank[idx]
  
  const dateKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
  
  // 从服务器加载
  try {
    const state = await getState()
    const answers = state.answers || {}
    if (answers[dateKey]) {
      myAnswer.value = answers[dateKey]
    }
    // 构建历史
    const list = []
    Object.keys(answers).sort().reverse().forEach(dk => {
      const seed2 = parseInt(dk.replace(/-/g, ''))
      const qIdx = ((parseInt(dk.split('-')[0]) * 10000 + parseInt(dk.split('-')[1]) * 100 + parseInt(dk.split('-')[2])) || seed2) % questionBank.length
      list.push({
        date: dk.replace(/-/g, '年').replace(/-/, '月') + '日',
        question: questionBank[qIdx] || questionBank[0],
        myAnswer: answers[dk]
      })
    })
    historyList.value = list
  } catch(e) {}
}

async function submitAnswer() {
  if (!answerText.value.trim()) {
    uni.showToast({ title: '写点什么吧 💕', icon: 'none' })
    return
  }
  const now = new Date()
  const dateKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()
  myAnswer.value = answerText.value.trim()
  
  await saveDailyAnswer(dateKey, myAnswer.value)
  
  historyList.value.unshift({
    date: todayDate.value,
    question: currentQuestion.value,
    myAnswer: myAnswer.value,
  })
  
  uni.showToast({ title: '回答已保存 💖', icon: 'none' })
}
</script>

<style scoped>
.daily-page {
  min-height: 100vh;
  padding-bottom: 30rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.08);
}

.question-card {
  background: linear-gradient(135deg, #FFF0F3, #FFE4E9);
  text-align: center;
  padding: 40rpx 30rpx;
}

.today-badge {
  font-size: 24rpx;
  color: #FF6B8A;
  background: rgba(255,107,138,0.1);
  display: inline-block;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  margin-bottom: 20rpx;
}

.question-icon {
  font-size: 60rpx;
  margin: 10rpx 0;
}

.question-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin: 16rpx 0;
  line-height: 1.6;
}

.question-date {
  font-size: 24rpx;
  color: #999;
}

.card-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.answer-label {
  font-size: 24rpx;
  color: #4CAF50;
}

.answer-label.pending {
  color: #FF9800;
}

.answer-content {
  display: block;
  margin-top: 16rpx;
  font-size: 30rpx;
  color: #555;
  line-height: 1.8;
  background: #FFF5F7;
  padding: 20rpx;
  border-radius: 16rpx;
}

.answer-input {
  width: 100%;
  height: 200rpx;
  background: #FFF5F7;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  margin-top: 16rpx;
  box-sizing: border-box;
  color: #333;
}

.btn-primary {
  margin-top: 20rpx;
  width: 100%;
  background: linear-gradient(135deg, #FF6B8A, #FF8FA3);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 0;
  font-size: 30rpx;
  font-weight: bold;
}

.waiting-tip {
  text-align: center;
  padding: 30rpx 0;
}

.waiting-emoji {
  font-size: 50rpx;
  display: block;
  margin-bottom: 10rpx;
}

.waiting-text {
  font-size: 26rpx;
  color: #999;
}

.history-card .history-list {
  margin-top: 20rpx;
}

.history-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #FFF0F3;
}

.history-item:last-child {
  border: none;
}

.history-date {
  font-size: 22rpx;
  color: #bbb;
}

.history-q {
  display: block;
  font-size: 28rpx;
  color: #FF6B8A;
  font-weight: bold;
  margin: 8rpx 0;
}

.history-a {
  display: block;
  font-size: 26rpx;
  color: #666;
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
