import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { User } from "./types/user";

type InputMsgProp = {
  msg: string;
  _id: string | null;
}

type InputProps = {
  dark: boolean;
  user: User;
  inputMessage: InputMsgProp;
  setInputMessage: (inputMessage: InputMsgProp) => void;
  insertMessage: () => void;
}

export default function Input({ dark, user, inputMessage, setInputMessage, insertMessage }: InputProps) {
  const handleSend = () => {
    if (!inputMessage.msg) return;
    insertMessage();
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
        <button className={`btn btn-success  ${!user || !inputMessage.msg ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend} >{inputMessage._id ? <EditIcon /> : <SendIcon />}</button>
      </form>
    </>
  )
}