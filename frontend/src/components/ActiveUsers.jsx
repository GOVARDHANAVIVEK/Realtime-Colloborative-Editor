import React, { useEffect } from 'react'

const ActiveUsers = ({activeUsers,documentId}) => {

    console.log("activeUsers",activeUsers , "doc id",documentId)
    
  return (
    
    <div className="flex w-[100%] h-[100%] bg-white shadow-lg rounded-lg  border border-gray-300 overflow-scroll m-auto py-4 px-4">
                    <div className="space-y-2">
                        {activeUsers.length > 0 ? (
                            <ul className="w-full text-gray-700 space-y-2 ">
                            {activeUsers.map((user, index) => (
                                <li key={index} className=" w-full py-1 flex space-x-2 text-center items-center">
                                <span className=' w-full'>👤 {user}</span>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500 text-center">No active users</p>
                        )}
                    </div>
                </div>
  )
}

export default ActiveUsers