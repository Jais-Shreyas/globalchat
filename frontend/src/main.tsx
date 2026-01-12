import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UserProvider } from './contexts/AuthContext'
import { AlertProvider } from './contexts/AlertContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { ContactProvider } from './contexts/ContactContext'
import { MessagesProvider } from './contexts/MessagesContext'
import { ThemeProvider } from './contexts/ThemeContext'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <AlertProvider>
      <ThemeProvider>
        <UserProvider>
          <WebSocketProvider>
            <ContactProvider>
              <MessagesProvider>
                <App />
              </MessagesProvider>
            </ContactProvider>
          </WebSocketProvider>
        </UserProvider>
      </ThemeProvider>
    </AlertProvider>
  </StrictMode>,
)
