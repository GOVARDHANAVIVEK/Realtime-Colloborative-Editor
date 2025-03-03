import React from 'react'

const NotificationAlert = ({message,key,index,onClickNotification,docID,notificationMessagesStyle}) => {
    console.log("notification_message",message)
    console.log("notificationMessagesStyle",notificationMessagesStyle)
  return (
    <p style={{backgroundColor:(notificationMessagesStyle && notificationMessagesStyle.backgroundColor)? notificationMessagesStyle.backgroundColor: "blue",color:(notificationMessagesStyle && notificationMessagesStyle.color) ? notificationMessagesStyle.color: "white"}}
    className='box-border w-[100%] h-max  p-2 m-1 overflow-hidden rounded-lg text-start'key={key}
        onClick={()=>onClickNotification(index,docID)}
    >
        {message}
    </p>
  )
}

export default NotificationAlert