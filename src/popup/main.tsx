import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './Popup.tsx'
import "../styles.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='bg-[rgb(33,31,31)]'>
    <Popup/>
    </div>
  </StrictMode>,
)
