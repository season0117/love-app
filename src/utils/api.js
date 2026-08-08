// CloudBase 云函数 API
const BASE = 'https://love-app-d3gezf6lf27ee3d6e.service.tcloudbase.com/api'

async function call(action, data = {}) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data })
  })
  return res.json()
}

export function getState() { return call('getState') }

export function saveLoveDate(date) { return call('saveLoveDate', { date }) }

export function saveAnniversary(name, date) { return call('saveAnniversary', { name, date }) }

export function saveDailyAnswer(dateKey, answer) { return call('saveDailyAnswer', { dateKey, answer }) }

export function sendMiss(text, emoji) {
  const now = new Date()
  return call('sendMiss', { text, emoji, time: (now.getMonth()+1)+'月'+now.getDate()+'日 '+now.getHours()+':'+String(now.getMinutes()).padStart(2,'0') })
}

export function getMissMessages() { return call('getMissMessages') }

export function getStoryHistory() { return call('getStoryHistory') }
export function addStoryToHistory(story) { return call('addStory', story) }
export function toggleStoryLike(dateKey, liked) { return call('toggleStoryLike', { dateKey, liked }) }
