// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'face-3915fb' })
const db = cloud.database()
const collection = db.collection('users_profiles')
// 云函数入口函数
exports.main = async (event, context) => {
  const rslt = await collection.add({
    data: {
      ...event.userInfo,
      createdAt: new Date().getTime(),
      path: event.path
    }
  })
  return rslt
}
