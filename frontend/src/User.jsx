import React from 'react';

const User = ({ activeUsers }) => {
  return (
    <div className='text-blue-600 text-5xl'>
      {console.log(activeUsers)}
      {activeUsers.map((user) => (
        <h3 key={user}>User: {user}</h3>  // ✅ Return JSX correctly
      ))}
    </div>
  );
};

export default User;
