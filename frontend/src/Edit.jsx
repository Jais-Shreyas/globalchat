import { useState } from "react"
import { Navigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';

export default function Edit({ dark, user, id, insertMessage }) {
  const [text, setText] = useState(id.msg);
  const handletext = (e) => {
    setText(e.target.value);
  }
  const handleSend = () => {
    insertMessage(text, id.id);
    // console.log(text);
    setText('');
  }
  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className={`container input-group mb-1 fixed-bottom`}>
        <input type="text" autoFocus value={text} className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`} onChange={(e) => handletext(e)} onSubmit={handleSend} placeholder="Enter your message" aria-label="Your message" aria-describedby="button-addon2" />
        <button className={`btn btn-success  ${!user ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend}><EditIcon /></button>
      </form>
    </>
  )
}