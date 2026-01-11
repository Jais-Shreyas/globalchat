import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import type { Alert } from './types/alert';

type InputMsgProp = {
  msg: string;
  _id: string | null;
}

type InputProps = {
  dark: boolean;
  showAlert: (alert: Alert) => void;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  activeContact: { conversationId: string } | null;
  inputMessage: InputMsgProp;
  setInputMessage: (inputMessage: InputMsgProp) => void;
  insertMessage: () => void;
  setInputHeight: (height: number) => void;
}

export default function Input({ dark, showAlert, focusRef, activeContact, inputMessage, setInputMessage, insertMessage, setInputHeight }: InputProps) {
  const handleSend = () => {
    if (inputMessage.msg.length > 2048) {
      showAlert({ type: 'danger', message: 'Message too long. Maximum length is 2048 characters.' });
      return;
    }
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
  const handleTextAreaUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(150, e.target.scrollHeight)}px`;
    setInputHeight(Math.min(150, e.target.scrollHeight));
    setInputMessage({ ...inputMessage, msg: e.target.value })
  }
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSend() }}
      className={`input-group`}
      style={{
        backgroundColor: dark ? '#212529' : 'white',
        position: 'sticky',
        bottom: '0',
      }}
    >
      <textarea
        id='input'
        ref={focusRef}
        placeholder={`${!activeContact ? 'Select a contact to start chatting' : 'Type your message here...'}`}
        value={inputMessage.msg || ''}
        className={`form-control btn-outline-success ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
        onChange={handleTextAreaUpdate}
        onKeyDown={handleKeyDown}
        aria-label="Your message"
        aria-describedby="button-addon2"
        disabled={!activeContact}
        style={{ minHeight: '36px', maxHeight: '150px', resize: 'none', overflowY: 'auto' }}
      ></textarea>
      <button className={`btn btn-success  ${!inputMessage.msg.trim() || !activeContact ? 'disabled' : ''}`} type="button" id="button-addon2" onClick={handleSend} >{inputMessage._id ? <EditIcon /> : <SendIcon />}</button>
    </form>
  )
}