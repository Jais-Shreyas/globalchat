import { useState } from "react"
import SendIcon from '@mui/icons-material/Send';
export default function Input({ dark, user, insertMessage, scroll, toggleScroll }) {
  const [text, setText] = useState('');
  const handletext = (e) => {
    setText(e.target.value);
  }
  const handleSend = () => {
    if (text) {
      insertMessage(text.trim());
    }
    setText('');
  }
  const handleKeyDown = (e) => {
    if (e.shiftKey) {
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  }
  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className={`container input-group mb-1 fixed-bottom`}>
        {user.username ?
          <>
            <textarea
              rows={1}
              autoFocus
              placeholder="Enter your message"
              value={text}
              className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
              onChange={(e) => handletext(e)}
              onKeyDown={handleKeyDown}
              aria-label="Your message"
              aria-describedby="button-addon2"
            ></textarea>
          </> : <>
            <input type="text" disabled placeholder="Login required" value="" className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`} onChange={(e) => handletext(e)} onSubmit={handleSend} aria-label="Your message" aria-describedby="button-addon2" />
          </>
        }
        <button className={`btn btn-success  ${!user || !text ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend} ><SendIcon /></button>
      </form>
    </>
  )
}