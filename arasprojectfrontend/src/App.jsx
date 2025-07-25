import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { Login } from './Pages/Login';
import HowToUse from './Pages/HowToUse';
import Dashboard from './Pages/Dashboard';

function App() {
 
  return (
    <>
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/use' element={<HowToUse />} />
      <Route path='/dashboard' element={<Dashboard />} />
    </Routes>
    </>
  )
}

export default App;
