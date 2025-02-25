import { useState } from 'react'
import {Route, Routes } from "react-router-dom";

import LandingPage from './LandingPage'
import Home from './Home';
import SignIn from './SignIn';
import SignUp from './SignUp';
import DocumentEditor from './DocumentEditor';

import './index.css'

import {NotificationProvider} from './NotificationProvider'
function App() {
 
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/document/editor/:documentId" element={<DocumentEditor />} />
        
        
      </Routes>
      </NotificationProvider>
  )
}

export default App
