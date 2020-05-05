// 引用linebot套件
import linebot from 'linebot'
// 引用dotenv套件
import dotenv from 'dotenv'
// 引用request套件
import rp from 'request-promise'

// 讀取.env檔
dotenv.config()

// 宣告機器人的資訊 ID 密碼 存取碼
const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

// 當加入好友時
bot.on('follow', async (event) => {
  let msg = ''
  try {
    msg = '您好，歡迎使用 36 小時天氣預報Line機器人，以下為使用說明：\n輸入「!縣市名稱」來查詢該縣市36小時內天氣預報，文字間不可含空格。範例：!臺北市'
  } catch (error) {
    msg = '發生錯誤'
  }
  event.reply(msg)
})
// 當收到訊息時
bot.on('message', async (event) => {
  let msg = ''
  let id = -1
  let txttrim = event.message.text.trim()
  String.full2half = function () {
    var temp = ''
    for (var i = 0; i < this.toString().length; i++) {
      var charCode = this.toString().charCodeAt(i)
      if (charCode >= 65281 && charCode <= 65374) {
        charCode -= 65248
      } else if (charCode === 12288) { // 全形轉半形
        charCode = 32
      }
      temp = temp + String.fromCharCode(charCode)
    }
    return temp
  }
  txttrim = txttrim.full2half()
  try {
    const data = await rp({ uri: 'https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-66420B34-870E-4663-8957-5FD6335D5647&format=JSON', json: true })
    for (const locationid in data.records.location) {
      if (txttrim === '!' + data.records.location[locationid].locationName) {
        id = locationid
      }
    }
    const RES = data.records.location[id]

    if (txttrim.startsWith('!')) {
      if (id === -1) {
        msg = '查無此縣市'
      } else {
        msg = `查詢${RES.locationName}的天氣預報：\n`
        for (let i = 0; i < RES.weatherElement[0].time.length; i++) {
          msg += `
${RES.weatherElement[0].time[i].startTime}至${RES.weatherElement[0].time[i].endTime}\n
天氣現象：${RES.weatherElement[0].time[i].parameter.parameterName}\n
降雨機率：${RES.weatherElement[1].time[i].parameter.parameterName}%\n
最低溫：${RES.weatherElement[2].time[i].parameter.parameterName}℃\n
最高溫：${RES.weatherElement[4].time[i].parameter.parameterName}℃\n
舒適度：${RES.weatherElement[3].time[i].parameter.parameterName}\n
`
        }
      }
    } else {
      msg = '請輸入「!縣市名稱」'
    }
  } catch (error) {
    msg = '發生錯誤'
  }
  event.reply(msg)
})
// 監聽訊息
bot.listen('/', process.env.PORT, () => {
  console.log('機器人已啟動')
})
