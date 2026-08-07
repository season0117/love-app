const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const COLL = 'love_state'
const DOC = 'shared'

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    // 获取全部状态
    case 'getState': {
      const res = await db.collection(COLL).doc(DOC).get()
      return { code: 0, data: res.data }
    }

    // 恋爱日期
    case 'saveLoveDate': {
      await db.collection(COLL).doc(DOC).update({ data: { loveDate: data.date } })
      return { code: 0 }
    }

    // 纪念日
    case 'saveAnniversary': {
      await db.collection(COLL).doc(DOC).update({
        data: { anniversary: { name: data.name, date: data.date } }
      })
      return { code: 0 }
    }

    // 每日回答
    case 'saveDailyAnswer': {
      await db.collection(COLL).doc(DOC).update({
        data: { [`answers.${data.dateKey}`]: data.answer }
      })
      return { code: 0 }
    }

    // 发送思念
    case 'sendMiss': {
      const res = await db.collection(COLL).doc(DOC).get()
      const msgs = res.data.missMessages || []
      msgs.unshift({ text: data.text, time: data.time, emoji: data.emoji || '💌' })
      await db.collection(COLL).doc(DOC).update({ data: { missMessages: msgs.slice(0, 50) } })
      return { code: 0, data: msgs.slice(0, 50) }
    }

    // 获取思念消息
    case 'getMissMessages': {
      const res = await db.collection(COLL).doc(DOC).get()
      return { code: 0, data: res.data.missMessages || [] }
    }

    // 故事历史
    case 'getStoryHistory': {
      const res = await db.collection(COLL).doc(DOC).get()
      return { code: 0, data: res.data.storyHistory || [] }
    }

    case 'addStory': {
      const res = await db.collection(COLL).doc(DOC).get()
      const list = res.data.storyHistory || []
      if (!list.find(s => s.dateKey === data.dateKey)) {
        list.unshift(data)
        await db.collection(COLL).doc(DOC).update({ data: { storyHistory: list.slice(0, 30) } })
      }
      return { code: 0, data: list.slice(0, 30) }
    }

    case 'toggleStoryLike': {
      const res = await db.collection(COLL).doc(DOC).get()
      const list = res.data.storyHistory || []
      const s = list.find(s => s.dateKey === data.dateKey)
      if (s) { s.liked = data.liked }
      await db.collection(COLL).doc(DOC).update({ data: { storyHistory: list } })
      return { code: 0, data: list }
    }

    // 初始化
    case 'init': {
      try {
        await db.collection(COLL).add({
          data: {
            _id: DOC,
            loveDate: '',
            anniversary: { name: '一周年纪念日', date: '' },
            answers: {},
            missMessages: [],
            storyHistory: []
          }
        })
      } catch (e) {
        await db.collection(COLL).doc(DOC).set({
          data: {
            loveDate: '',
            anniversary: { name: '一周年纪念日', date: '' },
            answers: {},
            missMessages: [],
            storyHistory: []
          }
        })
      }
      return { code: 0, msg: 'inited' }
    }

    default:
      return { code: -1, msg: 'unknown action' }
  }
}
