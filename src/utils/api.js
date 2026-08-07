// API 工具 - 统一从服务器获取/保存数据
const BASE = window.location.origin

async function apiGet(path) {
  const res = await fetch(BASE + path)
  return res.json()
}

async function apiPost(path, data) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export function getState() { return apiGet('/api/state') }

// 恋爱日期
export function saveLoveDate(date) { return apiPost('/api/love-date', { date }) }

// 纪念日
export function saveAnniversary(name, date) { return apiPost('/api/anniversary', { name, date }) }

// 每日问答
export function saveDailyAnswer(dateKey, answer) { return apiPost('/api/daily-answer', { dateKey, answer }) }

// 想你了
export function sendMiss(text, emoji) { return apiPost('/api/miss-send', { text, emoji }) }
export function getMissMessages() { return apiGet('/api/miss-messages') }

// 睡前故事
export function getStoryHistory() { return apiGet('/api/story-history') }
export function addStoryToHistory(story) { return apiPost('/api/story-add', story) }
export function toggleStoryLike(dateKey, liked) { return apiPost('/api/story-like', { dateKey, liked }) }
