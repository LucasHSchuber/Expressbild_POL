import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
// import './index.css'
import "./assets/css/main.css"
import "./assets/css/buttons.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
