import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import UserLogin from './components/UserLogin'
import ChatPage from './components/ChatPage'
import UserSingup from './components/UserSignup'


function App() {

  return (
    <div className='bg-base-200 h-screen w-screen'>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<UserLogin />} />
          <Route path='/signup' element={<UserSingup />} />
          <Route path='/ChatPage' element={<ChatPage />} />
        </Routes>
      </BrowserRouter >

    </div>
  )
}

export default App
