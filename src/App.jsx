import './index.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './Pages/LandingPage.jsx'
import CreateLetter from './Pages/CreateLetter.jsx'
import ViewLetter from './Pages/ViewLetter.jsx'
import ViewLetterFull from './Pages/ViewLetterFull.jsx' // 1. Import your new specific view page
import CreateAnonymous from './Pages/CreateAnonymous.jsx' 

function App() {
  return (
   <div>
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/create' element={<CreateLetter />} />
      
      {/* 2. Standard View for Anonymous Messages */}
      <Route path='/letter/:id' element={<ViewLetter />} />

      {/* 3. New View for Full Letters with Images */}
      <Route path='/view-full/:id' element={<ViewLetterFull />} />
      
      <Route path='/create-anonymous' element={<CreateAnonymous />} />
    </Routes>
   </div> 
  )
}

export default App