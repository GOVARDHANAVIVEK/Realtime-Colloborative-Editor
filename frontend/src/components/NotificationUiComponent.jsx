import React from 'react'
import NotificationAlert from './NotificationAlert'
const NotificationUiComponent = ({notifications,onClickNotification,notificationMessagesStyle}) => {
    console.log("notifications",notifications)
    
  return (
    <div className='box-border absolute top-14 w-98 h-40 right-90 bg-white rounded-lg overflow-hidden overflow-y-scroll p-3 cursor-pointer'>
    {notifications && notifications.length > 0 ? (
        notifications.slice().reverse().map((message, index) => (
            <NotificationAlert notificationMessagesStyle={notificationMessagesStyle} message={message.text} key={index} index={index} onClickNotification={onClickNotification} docID={message.docId}/>
        ))
    ) : (
        <NotificationAlert message={"No Messages"} />
    )}
</div>

  )
}

export default NotificationUiComponent