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
        <textarea
          rows={1}
          autoFocus
          placeholder={`${user.username ? "Enter your message" : "Login required"}`}
          value={text}
          className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
          onChange={(e) => handletext(e)}
          onKeyDown={handleKeyDown}
          aria-label="Your message"
          aria-describedby="button-addon2"
          readOnly={!user.username ? true : false}
        ></textarea>
        <button className={`btn btn-success  ${!user || !text ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend} ><SendIcon /></button>
      </form>
    </>
  )
}