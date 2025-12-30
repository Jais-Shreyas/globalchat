import { useState } from "react"
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { User } from "./types/user";

type InputMsgProp = {
  msg: string;
  id: string | null;
}

type InputProps = {
  dark: boolean;
  user: User;
  inputMessage: InputMsgProp;
  setInputMessage: (inputMessage: InputMsgProp) => void;
  insertMessage: (msg: string, id?: string | null) => void;
}

export default function Input({ dark, user, inputMessage, setInputMessage, insertMessage }: InputProps) {
  const handleSend = () => {
    if (!inputMessage.msg) return;
    if (inputMessage.id) {
      insertMessage(inputMessage.msg.trim(), inputMessage.id);
    } else {
      insertMessage(inputMessage.msg.trim());
    }
    setInputMessage({ msg: '', id: null });
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          value={inputMessage.msg || ''}
          className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
          onChange={(e) => setInputMessage({ ...inputMessage, msg: e.target.value })}
          onKeyDown={handleKeyDown}
          aria-label="Your message"
          aria-describedby="button-addon2"
          readOnly={!user.username ? true : false}
        ></textarea>
        <button className={`btn btn-success  ${!user || !inputMessage.msg ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend} >{inputMessage.id ? <EditIcon /> : <SendIcon />}</button>
      </form>
    </>
  )
}