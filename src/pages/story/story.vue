<template>
  <view class="story-page">
    <!-- 夜色顶部氛围区 -->
    <view class="night-header">
      <view class="moon-area">
        <text class="moon-emoji">🌙</text>
        <view class="stars-row">
          <text class="star s1">✨</text>
          <text class="star s2">⭐</text>
          <text class="star s3">✨</text>
          <text class="star s4">🌟</text>
          <text class="star s5">✨</text>
        </view>
      </view>
      <text class="night-title">睡前小故事</text>
      <text class="night-sub">每晚一个温暖故事，伴你入眠</text>
    </view>

    <!-- 今日故事卡片 -->
    <view class="story-card">
      <!-- 故事头部信息 -->
      <view class="story-header">
        <view class="story-badge">
          <text class="badge-icon">📖</text>
          <text class="badge-text">{{ todayDate }}</text>
        </view>
        <view class="story-meta">
          <text class="meta-item">🕐 阅读约 {{ storyReadTime }}</text>
          <text class="meta-item">💤 睡前故事 #{{ storyIndex }}</text>
        </view>
      </view>

      <!-- 带装饰的故事标题 -->
      <view class="story-title-area">
        <text class="title-deco">━ ✦ ━</text>
        <text class="story-title">{{ currentStory.title }}</text>
        <text class="title-deco">━ ✦ ━</text>
      </view>

      <!-- 故事正文 - 带首字大写效果 -->
      <view class="story-content">
        <text class="story-text">
          <text class="drop-cap">{{ currentStory.content.charAt(0) }}</text>
          {{ currentStory.content.slice(1) }}
        </text>
      </view>

      <!-- 故事结尾小提示 -->
      <view class="story-footer">
        <view class="divider">
          <text class="divider-dot">•</text>
          <text class="divider-line"></text>
          <text class="divider-icon">💗</text>
          <text class="divider-line"></text>
          <text class="divider-dot">•</text>
        </view>
        <text class="goodnight-text">晚安，我的爱人 🌙</text>
        <text class="goodnight-sub">明天这个时候，会有新的故事等你</text>
      </view>
    </view>

    <!-- 收藏按钮 -->
    <view class="action-area">
      <view class="fav-btn" :class="{ liked: isLiked }" @tap="toggleLike">
        <text class="fav-icon">{{ isLiked ? '💗' : '🤍' }}</text>
        <text class="fav-text">{{ isLiked ? '已收藏' : '收藏故事' }}</text>
      </view>
    </view>

    <!-- 往期故事 -->
    <view class="history-section">
      <text class="section-title">📚 往期故事</text>
      <view v-if="historyStories.length > 0" class="history-list">
        <view 
          v-for="(item, idx) in historyStories" 
          :key="idx" 
          class="history-item"
          @tap="showStoryDetail(item)"
        >
          <view class="h-left">
            <text class="h-moon">🌙</text>
            <view class="h-info">
              <text class="h-title">{{ item.title }}</text>
              <text class="h-date">{{ item.date }}</text>
            </view>
          </view>
          <text class="h-arrow">›</text>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-emoji">🌙</text>
        <text class="empty-text">明天回来，第一个故事就会出现~</text>
      </view>
    </view>

    <!-- 故事详情弹窗 -->
    <view class="modal-overlay" v-if="showModal" @tap="closeModal">
      <view class="modal-card" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ detailStory.title }}</text>
          <view class="modal-close" @tap="closeModal">✕</view>
        </view>
        <scroll-view class="modal-body" scroll-y>
          <text class="modal-text">{{ detailStory.content }}</text>
        </scroll-view>
        <text class="modal-date">{{ detailStory.date }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getStoryHistory, addStoryToHistory, toggleStoryLike as apiToggleLike } from '@/utils/api.js'

// 故事库 - 25个原创睡前小故事
const storyBank = [
  {
    title: '星空下的约定',
    content: '小熊和小兔子躺在草地上看星星。小熊说："你看，那颗最亮的星星，像不像你的眼睛？"小兔子害羞地往小熊怀里钻了钻："那旁边那颗，就像你的笑容。"小熊轻轻抱住小兔子："以后每个夜晚，我都陪你看星星好不好？"小兔子点点头，在星光和爱人的怀抱里，甜甜地睡着了。夜风轻轻吹过，星星眨着眼睛，守护着这对恋人的约定。',
    readTime: 2
  },
  {
    title: '月亮婆婆的悄悄话',
    content: '月亮婆婆最喜欢看地上的恋人了。今晚，她看到男孩轻轻给女孩掖好被角，女孩迷迷糊糊地说："别走……"男孩温柔地在她额头印下一个吻："我不走，就在这儿。"月亮婆婆笑了，洒下最柔和的月光，像一条银色的毯子，盖在两人身上。她悄悄对小星星们说："你们看，这就是爱情最美的样子呀。"',
    readTime: 2
  },
  {
    title: '雨天的拥抱',
    content: '那天突然下起了大雨，你没有带伞。就在你准备冲进雨里的时候，TA气喘吁吁地跑了过来，手里举着一把伞，自己却淋湿了大半。"怎么不等等我？"TA假装生气地说。你看着TA湿漉漉的头发，心里暖暖的。一把伞下的距离刚刚好，刚好可以听到彼此的心跳。雨声很大，但TA的声音更清晰："以后下雨，等我来接你。"',
    readTime: 2
  },
  {
    title: '蒲公英的思念',
    content: '小蒲公英对风说："带我去TA在的地方吧。"风问："那么远，你不怕吗？"小蒲公英笑了："不怕，只要能落在TA的窗台上，让TA每天清晨推开窗就能看到我，多远都值得。"风被感动了，轻轻托起小蒲公英，飞过山川河流，终于在黄昏时分，把她送到了那个熟悉的窗台。第二天清晨，TA推开窗，一朵小小的蒲公英正在晨光中微笑。',
    readTime: 2
  },
  {
    title: '小星星找家',
    content: '有一颗小星星，总觉得自己不够亮，害怕没有人会喜欢它。它从天边飘到海边，从山脚飞到云端，想找一个愿意接纳它的地方。它问月亮，月亮说："你该去问问地上的人。"于是小星星小心翼翼地把光芒洒向地面。一个小女孩抬起头："妈妈你看，那颗星星好温柔啊！"小星星突然明白了——原来在爱你的人眼里，你永远是最亮的那颗。',
    readTime: 2
  },
  {
    title: '温暖的抱抱',
    content: '冬天到了，森林里的小动物们都冷得瑟瑟发抖。小熊找到小兔子，张开双臂："来，我抱抱你就不冷了。"小兔子钻进小熊怀里，果然暖洋洋的。小熊说："我有一个超能力，只要抱着你，我的心就变得好温暖，这份温暖会从心里一直传到手上，再传到你身上。"小兔子抬起头："那我要一直让你抱着。"小熊笑了："好啊，抱一辈子。"',
    readTime: 2
  },
  {
    title: '云朵枕头',
    content: '有一天，TA对你说："我送你一个特别的枕头。"你好奇地问是什么。TA神秘地笑了笑，然后让你靠在TA的肩膀上。"感觉到了吗？这是世界上最舒服的枕头，而且它只属于你一个人。"你靠在TA肩上，闻着TA身上淡淡的洗衣液香味，听着TA均匀的呼吸声。不知不觉，你就睡着了。在梦里，你躺在软软的云朵上，而TA就在你身边。',
    readTime: 2
  },
  {
    title: '萤火虫之约',
    content: '夏夜的森林里，萤火虫们举办了一场盛大的舞会。男孩牵着女孩的手，穿过灌木丛，来到一片空地。突然，成百上千只萤火虫亮了起来，像是一盏盏为爱情点亮的小灯笼。男孩从口袋里掏出一个玻璃瓶，里面装着一只萤火虫。"这是去年夏天我抓到的，养了一整年，就为今天带你来。"女孩的眼睛里映着萤火虫的光，比星星还亮。',
    readTime: 2
  },
  {
    title: '贝壳的秘密',
    content: '他们在海边散步，女孩捡起一个漂亮的贝壳贴在耳边。"你听，是大海的声音！"男孩接过贝壳，也听了听，然后认真地说："不对，我在里面听到的是你的笑声。"女孩脸红了："贝壳怎么可能录下笑声？"男孩把贝壳轻轻放进女孩手心："因为我每次和你在一起的时候，大海都在帮我们记着呢。所有美好的声音，都被贝壳收藏了。"',
    readTime: 2
  },
  {
    title: '风筝与风',
    content: '风筝对风说："谢谢你托着我飞这么高。"风说："是你自己勇敢，才飞得起来的。"风筝笑了："可是如果没有你，我只是一张纸和几根竹条。"风温柔地环绕着风筝："那我们要一直这样，你负责勇敢，我负责托举。不管飞多高多远，我都不会松开你。"夕阳西下，风筝和风在天边画出了一道最美的弧线，地上的恋人们抬头看着，许下了同样的心愿。',
    readTime: 2
  },
  {
    title: '彩虹桥的尽头',
    content: '传说彩虹桥的尽头，藏着世界上最甜蜜的东西。小熊和小兔子决定去找找看。它们走啊走，翻过山，趟过河，终于走到了彩虹脚下。可是那里什么也没有。小兔子有点失望，小熊却指着地上说："你看，是我们的影子！"两个影子紧紧地靠在一起，被彩虹映成了粉色。"我明白了，"小兔子说，"最甜蜜的东西，就是和你在一起。"',
    readTime: 2
  },
  {
    title: '雪天的第一个约定',
    content: '那年冬天的第一场雪，男孩在女孩家楼下等了一个小时。女孩下楼时，看到男孩头发上落满了雪花，鼻子冻得通红。女孩心疼地帮他拍掉雪，男孩却从身后变出一个保温杯："给你煮的姜茶，趁热喝。"女孩捧着杯子，手心是热的，心里更热。男孩说："以后每年第一场雪，我都给你煮姜茶。"女孩点点头，雪花落在两人之间，像是天空送上的祝福。',
    readTime: 2
  },
  {
    title: '向日葵的微笑',
    content: '向日葵总是仰着脸追逐太阳。有人问它："你累不累呀？每天都仰着头。"向日葵说："不累呀，因为太阳是我最爱的人。只要能看到TA，我就浑身充满力量。"那人又问："那阴天呢？太阳被云遮住了怎么办？"向日葵笑了："那我就闭上眼睛，在心里画一个太阳。TA的样子，我闭着眼也能看见。"',
    readTime: 2
  },
  {
    title: '漂流瓶的心愿',
    content: '海边住着一个小女孩，她每天都会往海里放一个漂流瓶，瓶子里写着同一个心愿："希望遇到一个温柔的人。"有一天，一个小男孩在海滩上捡到了这个瓶子。他打开纸条，想了想，也写了一张纸条放进去，把瓶子重新抛回海里。第二天，小女孩在海边又捡到了那个瓶子，里面多了一句话："我愿意变成那个人，可以吗？"从那天起，他们再也没有放过漂流瓶。',
    readTime: 2
  },
  {
    title: '路灯下的影子',
    content: '每天晚上回家，他们都要经过那条种满梧桐树的路。橘黄色的路灯把影子拉得好长好长。TA突然停下脚步，看着地上两个靠在一起的影子说："你看，连我们的影子都在牵手。"你低头看了看，真的，不知道什么时候，影子的小手指已经勾在了一起。你说："那就让它们一直牵着吧，反正我们也不打算松开。"晚风轻轻吹过梧桐叶，沙沙的声音，像在说悄悄话。',
    readTime: 2
  },
  {
    title: '樱花树下的信',
    content: '校园里有一棵老樱花树，树下埋着一个铁盒子。那是他们刚在一起时埋下的，里面装着写给十年后彼此的信。每年樱花盛开的时候，他们都会来树下坐一会儿。男孩说："等十年到了，我们打开盒子，看看对方的信，一定很好笑。"女孩靠在他肩上："不好笑，肯定很感动。因为不管是十年前还是十年后，爱你的心都没有变过。"樱花花瓣飘落在他们身上，像一封封粉色的情书。',
    readTime: 2
  },
  {
    title: '许愿树',
    content: '森林里有一棵神奇的许愿树，每年只结一颗果子。想要摘果子的人，必须说出一个最真诚的愿望。今年，小熊和小兔子手牵手来到了树下。树爷爷问："你们想要什么？"小熊和小兔子对视一眼，异口同声地说："希望下辈子、下下辈子，还能遇到你。"树爷爷哈哈大笑，树上瞬间挂满了金色的果实。这么多年，这是他听过最甜的愿望。',
    readTime: 2
  },
  {
    title: '时间的礼物',
    content: '上帝在创造恋人的时候，把一块完整的拼图分成了两半，散落在茫茫人海中。有些人找了一辈子也找不到，有些人找到了却拼不上。只有真正契合的两半，才能在相遇的那一刻严丝合缝地拼在一起。你和TA就是那两半拼图。所以每一次争吵后的和好、每一次离别后的重逢、每一次牵手、每一次拥抱——都是时间送给你们最好的礼物。',
    readTime: 2
  },
  {
    title: '月光小船',
    content: '今晚的月亮特别圆，月光洒在湖面上，像一条银色的路。小狐狸拉着小猫咪的手说："我们坐月光小船去旅行吧。"小猫咪问："月光小船在哪里呀？"小狐狸指着湖面上的月亮倒影："你看，月亮掉进水里了，那就是我们的船。"于是它们坐在湖边，把脚伸进凉凉的湖水里，假装正在远航。小猫咪靠着小狐狸的肩膀说："这是我去过最远的地方，也是最近的地方——离你的心最近。"',
    readTime: 2
  },
  {
    title: '小猫的晚安电话',
    content: '每天晚上十点，小猫都会准时给小狗打电话。"喂，你睡了吗？"小猫问。"还没有呀，在等你的电话。"小狗回答。其实它们白天已经在一起待了一整天了，可是到了晚上，还是有说不完的话。从今天吃了什么好吃的，到看到一朵奇怪的云，再到明天想去哪里玩。说着说着，小猫的声音越来越小，最后只剩下均匀的呼吸声。小狗没有挂电话，轻轻说了句"晚安"，然后听着话筒里的呼吸声，微笑着闭上眼睛。',
    readTime: 2
  },
  {
    title: '北极星的指引',
    content: '小熊第一次去远方旅行，小兔子送给他一个小小的指南针。"迷路的时候，就看这个。"小熊走了很远很远，有一天指南针坏了，他真的迷路了。他好想小兔子，心想这下完了。突然，他想起小兔子说过的一句话："我不在的时候，就找夜空中最亮的那颗北极星。它会像我一样，一直指着回家的方向。"小熊抬起头，北极星正在天边闪闪发光，就像是小兔子的眼睛。他找到了回家的路，而小兔子正站在家门口等他。',
    readTime: 2
  },
  {
    title: '折一千只纸鹤',
    content: '听说折满一千只纸鹤，就可以实现一个愿望。女孩开始偷偷折纸鹤，每天一只。她准备了彩色的纸，每一只纸鹤的翅膀里都写着一句想对男孩说的话。折到第九百九十九只的时候，男孩发现了。他问："你在折什么呀？"女孩红着脸把盒子打开，五颜六色的纸鹤哗啦啦地飞了出来。男孩捡起一只，看到里面写着："希望每天都能看到你的笑。"他又捡起一只："想你的时候，折一只纸鹤。"男孩把所有的纸鹤小心地收进盒子："剩下的那一只，我们一起折吧。"',
    readTime: 2
  },
  {
    title: '冬日暖阳',
    content: '冬天的早晨好冷，你蜷缩在被窝里不想起床。TA已经悄悄起了床，在厨房里忙碌。不一会儿，你闻到了牛奶和面包的香气。TA端着早餐走进来，把托盘放在床头柜上，然后用自己的脸贴了贴你的脸。"快起来吧小懒虫，太阳都晒屁股了。"你迷迷糊糊睁开眼睛，看到阳光正好洒在TA的侧脸上。你突然觉得冬天一点也不冷，因为你就是我的小太阳。',
    readTime: 2
  },
  {
    title: '远方的思念',
    content: '异地恋的日子里，他们每天都会在睡前视频。今天女孩加班到很晚，打开手机发现男孩已经发了好多条消息。"到家了吗？""吃饭了吗？""别太累了。""我给你点了外卖，记得拿。""我等你。""不急，你慢慢来。""我想你了。"最后一条是三分钟前发的。女孩鼻子一酸，拨通了视频。屏幕亮起来，男孩的脸出现在画面里，笑着说："终于等到你了。"距离很远，但爱很近很近。',
    readTime: 2
  },
  {
    title: '一辈子很长',
    content: '老爷爷和老奶奶坐在公园的长椅上，看着夕阳一点点落下。老奶奶说："老头子，你说一辈子有多长啊？"老爷爷想了想，握住老奶奶的手："一辈子啊，就是我们从二十岁走到现在，你的头发从黑变白，我的背从直到弯。就是看着孩子长大、离开，最后又只剩下我们两个。就是吵过架、红过脸，但每天晚上还是想牵着你的手入睡。"老奶奶把头靠在老爷爷肩上："那这一辈子，刚刚好。"夕阳把两个老人的影子拉得很长很长，像他们一起走过的路。',
    readTime: 3
  }
]

const todayDate = ref('')
const storyIndex = ref(0)
const currentStory = ref(storyBank[0])
const storyReadTime = ref('')
const isLiked = ref(false)
const historyStories = ref([])
const showModal = ref(false)
const detailStory = ref({ title: '', content: '', date: '' })

onMounted(() => {
  loadTodayStory()
})

async function loadTodayStory() {
  const now = new Date()
  todayDate.value = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日'
  const dateKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()

  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const idx = seed % storyBank.length
  storyIndex.value = idx + 1
  currentStory.value = storyBank[idx]
  storyReadTime.value = currentStory.value.readTime + '分钟'

  // 从服务器加载历史
  try {
    const list = await getStoryHistory()
    historyStories.value = list || []
    // 检查今天是否已在历史
    const exists = historyStories.value.find(i => i.dateKey === dateKey)
    if (!exists) {
      const newEntry = {
        date: todayDate.value,
        dateKey: dateKey,
        title: currentStory.value.title,
        content: currentStory.value.content,
        liked: false
      }
      historyStories.value.unshift(newEntry)
      await addStoryToHistory(newEntry)
    }
    // 检查今日收藏状态
    const today = historyStories.value.find(i => i.dateKey === dateKey)
    if (today) isLiked.value = !!today.liked
  } catch(e) {}
}

async function toggleLike() {
  const now = new Date()
  const dateKey = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate()

  isLiked.value = !isLiked.value
  await apiToggleLike(dateKey, isLiked.value)
  
  // 更新本地历史
  const item = historyStories.value.find(i => i.dateKey === dateKey)
  if (item) item.liked = isLiked.value
}

function showStoryDetail(item) {
  detailStory.value = item
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
</script>

<style scoped>
.story-page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 15%, #4a2c6e 30%, #6b3fa0 50%, #FFF5F7 65%);
}

/* ======= 顶部夜色氛围 ======= */
.night-header {
  padding: 60rpx 30rpx 30rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.moon-area {
  position: relative;
  display: inline-block;
  margin-bottom: 16rpx;
}

.moon-emoji {
  font-size: 80rpx;
  display: block;
  animation: moonGlow 3s ease-in-out infinite;
}

@keyframes moonGlow {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.08); opacity: 1; }
}

.stars-row {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 500rpx;
  height: 100rpx;
  pointer-events: none;
}

.star {
  position: absolute;
  font-size: 26rpx;
  animation: starTwinkle 2s ease-in-out infinite;
}

.star.s1 { top: 0rpx; left: 80rpx; animation-delay: 0s; }
.star.s2 { top: 10rpx; right: 90rpx; animation-delay: 0.4s; font-size: 22rpx; }
.star.s3 { top: 20rpx; left: 160rpx; animation-delay: 0.8s; font-size: 20rpx; }
.star.s4 { top: 5rpx; right: 150rpx; animation-delay: 1.2s; font-size: 30rpx; }
.star.s5 { top: 15rpx; left: 250rpx; animation-delay: 1.6s; font-size: 18rpx; }

@keyframes starTwinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.night-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
  display: block;
  margin-top: 10rpx;
  text-shadow: 0 2rpx 12rpx rgba(138, 43, 226, 0.5);
}

.night-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 8rpx;
}

/* ======= 故事卡片 ======= */
.story-card {
  background: linear-gradient(160deg, #fffef9 0%, #fff8f0 30%, #fff0f5 100%);
  border-radius: 28rpx;
  margin: 0 24rpx 24rpx;
  padding: 36rpx 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(107, 63, 160, 0.15);
  position: relative;
  overflow: hidden;
}

.story-card::before {
  content: '';
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 160rpx;
  height: 160rpx;
  background: radial-gradient(circle, rgba(255, 182, 193, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

/* 故事标题区 */
.story-header {
  margin-bottom: 20rpx;
}

.story-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.badge-icon {
  font-size: 28rpx;
}

.badge-text {
  font-size: 24rpx;
  color: #9b6db8;
  font-weight: 500;
  background: rgba(155, 109, 184, 0.08);
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
}

.story-meta {
  display: flex;
  gap: 24rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #b8a0c8;
}

/* 标题装饰 */
.story-title-area {
  text-align: center;
  padding: 10rpx 0 24rpx;
}

.title-deco {
  font-size: 22rpx;
  color: #d4b8e8;
  display: inline;
  letter-spacing: 4rpx;
}

.story-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #4a2070;
  display: inline;
  margin: 0 16rpx;
  line-height: 1.4;
}

/* 正文 */
.story-content {
  padding: 0 4rpx;
  line-height: 2.1;
}

.story-text {
  font-size: 30rpx;
  color: #4a3a52;
  text-align: justify;
  letter-spacing: 1rpx;
}

.drop-cap {
  font-size: 52rpx;
  font-weight: bold;
  color: #9b59b6;
  float: left;
  line-height: 1;
  margin-right: 8rpx;
  margin-top: 2rpx;
}

/* 故事结尾 */
.story-footer {
  text-align: center;
  margin-top: 36rpx;
  padding-top: 16rpx;
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.divider-dot {
  font-size: 16rpx;
  color: #d4b8e8;
}

.divider-line {
  width: 60rpx;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #d4b8e8, transparent);
}

.divider-icon {
  font-size: 24rpx;
}

.goodnight-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #9b59b6;
  display: block;
  margin-bottom: 8rpx;
}

.goodnight-sub {
  font-size: 22rpx;
  color: #c4a8d8;
  display: block;
}

/* ======= 收藏按钮 ======= */
.action-area {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.fav-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 18rpx 48rpx;
  background: #fff;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 16rpx rgba(155, 109, 184, 0.12);
  transition: all 0.3s;
}

.fav-btn:active {
  transform: scale(0.95);
}

.fav-btn.liked {
  background: linear-gradient(135deg, #fff0f5, #ffe0ec);
  box-shadow: 0 4rpx 20rpx rgba(255, 105, 180, 0.2);
}

.fav-icon {
  font-size: 34rpx;
}

.fav-text {
  font-size: 28rpx;
  color: #9b6db8;
  font-weight: 500;
}

/* ======= 往期故事 ======= */
.history-section {
  margin: 0 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #4a2070;
  display: block;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.history-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(107, 63, 160, 0.08);
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f8f0fc;
  transition: background 0.2s;
}

.history-item:active {
  background: #fdf5ff;
}

.history-item:last-child {
  border: none;
}

.h-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
  min-width: 0;
}

.h-moon {
  font-size: 32rpx;
}

.h-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.h-title {
  font-size: 28rpx;
  color: #4a2070;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.h-date {
  font-size: 22rpx;
  color: #b8a0c8;
}

.h-arrow {
  font-size: 36rpx;
  color: #d4b8e8;
  font-weight: bold;
}

/* ======= 弹窗 ======= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 60rpx;
}

.modal-card {
  background: #fffef9;
  border-radius: 28rpx;
  width: 100%;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #f8f0fc;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #4a2070;
  flex: 1;
}

.modal-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #b8a0c8;
  background: #fdf5ff;
  border-radius: 50%;
}

.modal-body {
  padding: 24rpx 32rpx;
  max-height: 50vh;
}

.modal-text {
  font-size: 29rpx;
  color: #4a3a52;
  line-height: 2;
  text-align: justify;
}

.modal-date {
  font-size: 22rpx;
  color: #b8a0c8;
  text-align: center;
  padding: 16rpx 0 24rpx;
}

/* ======= 空状态 ======= */
.empty-state {
  text-align: center;
  padding: 60rpx 0;
}

.empty-emoji {
  font-size: 60rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #b8a0c8;
}
</style>
