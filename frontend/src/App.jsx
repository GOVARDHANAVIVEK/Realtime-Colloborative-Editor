import { useEffect, useState } from 'react'
import {Route, Routes,useNavigate  } from "react-router-dom";

import LandingPage from './LandingPage'
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';
import DocumentEditor from './DocumentEditor';

import './index.css'
import { SocketProvider } from './SocketProvider';
import {NotificationProvider} from './NotificationProvider'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token)
  });

  

  return (
    <NotificationProvider>
      {isAuthenticated ?(
        <SocketProvider isAuthenticated={isAuthenticated}>
          <Routes>
            <Route path="/home" element={<Home setIsAuthenticated={setIsAuthenticated}/>} />
            <Route path="/document/editor/:documentId" element={<DocumentEditor />} />
          </Routes>
        </SocketProvider>
        ):(
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signin" element={<SignIn setIsAuthenticated={setIsAuthenticated}/>} />
          </Routes>
      )}
      </NotificationProvider>
  )
}

export default App
