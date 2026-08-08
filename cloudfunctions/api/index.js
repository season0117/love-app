const cloudbase = require('@cloudbase/node-sdk')

exports.main = async (event, context) => {
  let body = event
  if (typeof event.body === 'string') {
    try { body = JSON.parse(event.body) } catch(e) {}
  }
  if (typeof event.body === 'object' && event.body !== null) {
    body = event.body
  }

  let action = body.action
  let data = body.data
  if (!action && typeof event.queryStringParameters === 'object') {
    action = event.queryStringParameters.action
  }

  if (!action) {
    return { code: -1, msg: 'no action found', eventKeys: Object.keys(event) }
  }

  const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV })
  const db = app.database()
  const COLL = 'love_state'
  const DOC = 'shared'

  async function ensureDoc() {
    try {
      await db.collection(COLL).add({
        _id: DOC,
        loveDate: '',
        anniversary: { name: '一周年纪念日', date: '' },
        answers: {},
        missMessages: [],
        storyHistory: []
      })
    } catch(e) {}
  }

  await ensureDoc()

  try {
    switch (action) {
      case 'getState': {
        const res = await db.collection(COLL).doc(DOC).get()
        return { code: 0, data: res[0] || {} }
      }
      case 'saveLoveDate': {
        await db.collection(COLL).doc(DOC).update({ loveDate: data.date })
        return { code: 0 }
      }
      case 'saveAnniversary': {
        await db.collection(COLL).doc(DOC).update({ anniversary: { name: data.name, date: data.date } })
        return { code: 0 }
      }
      case 'saveDailyAnswer': {
        await db.collection(COLL).doc(DOC).update({ ['answers.' + data.dateKey]: data.answer })
        return { code: 0 }
      }
      case 'sendMiss': {
        const res = await db.collection(COLL).doc(DOC).get()
        const doc = res[0] || { missMessages: [] }
        const msgs = doc.missMessages || []
        msgs.unshift({ text: data.text, time: data.time, emoji: data.emoji || '💌' })
        await db.collection(COLL).doc(DOC).update({ missMessages: msgs.slice(0, 50) })
        return { code: 0, data: msgs.slice(0, 50) }
      }
      case 'getMissMessages': {
        const res = await db.collection(COLL).doc(DOC).get()
        return { code: 0, data: (res[0]?.missMessages) || [] }
      }
      case 'getStoryHistory': {
        const res = await db.collection(COLL).doc(DOC).get()
        return { code: 0, data: (res[0]?.storyHistory) || [] }
      }
      case 'addStory': {
        const res = await db.collection(COLL).doc(DOC).get()
        const list = (res[0]?.storyHistory) || []
        if (!list.find(s => s.dateKey === data.dateKey)) {
          list.unshift(data)
          await db.collection(COLL).doc(DOC).update({ storyHistory: list.slice(0, 30) })
        }
        return { code: 0, data: list.slice(0, 30) }
      }
      case 'toggleStoryLike': {
        const res = await db.collection(COLL).doc(DOC).get()
        const list = (res[0]?.storyHistory) || []
        const s = list.find(i => i.dateKey === data.dateKey)
        if (s) s.liked = data.liked
        await db.collection(COLL).doc(DOC).update({ storyHistory: list })
        return { code: 0, data: list }
      }
      default:
        return { code: -1, msg: 'unknown action: ' + action }
    }
  } catch(e) {
    return { code: -2, msg: e.message }
  }
}