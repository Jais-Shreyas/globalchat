import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import { useContacts } from '../contexts/ContactContext';
import { useAlert } from '../contexts/AlertContext';
import '../styles/Input.css'
import { useEffect, useState } from 'react';
import { uploadFile } from '../helpers/fileUpload';
import { CircularProgress } from '@mui/material';

type InputMsgProp = {
  msg: string;
  _id: string | null;
}

type FileProp = {
  fileId: string,
  uploadId?: string,
  name: string,
  mimeType: string,
  size: number;
} | null;

type InputProps = {
  dark: boolean;
  isMobile: boolean;
  focusRef: React.RefObject<HTMLTextAreaElement> | null;
  inputMessage: InputMsgProp;
  setInputMessage: (inputMessage: InputMsgProp) => void;
  file: FileProp;
  setFile: (file: FileProp) => void;
  sendMessage: () => void;
  setInputHeight: (height: number) => void;
}

export default function Input({ dark, isMobile, focusRef, inputMessage, setInputMessage, file, setFile, sendMessage, setInputHeight }: InputProps) {
  const { activeContact } = useContacts();
  const { showAlert } = useAlert();
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  const handleSend = () => {
    if (!activeContact) return;
    if ((!inputMessage.msg.trim() && !file) || isUploadingFile) {
      return;
    }
    if (inputMessage.msg.length > 100 * 1024) { // 100 KB limit
      showAlert({ type: 'danger', message: 'Message too long. Maximum length is 102400 characters.' });
      return;
    }
    sendMessage();
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isMobile) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const resizeTextArea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const height = Math.min(180, textarea.scrollHeight);
    textarea.style.height = `${height}px`;
    setInputHeight(height);
  };
  useEffect(() => {
    if (!focusRef?.current) return;
    resizeTextArea(focusRef.current);
  }, [inputMessage.msg]);

  const handleTextAreaUpdate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > 100 * 1024) { // 100 KB limit
      showAlert({ type: 'danger', message: 'Message too long. Maximum length is 102400 characters.' });
      return;
    }
    resizeTextArea(e.target);
    setInputMessage({ ...inputMessage, msg: value });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    try {
      setIsUploadingFile(true);
      const data = await uploadFile(file);
      setFile(data);

    } catch (err) {
      setFile(null);
      console.error(err);
      showAlert({
        type: "danger",
        message: "File upload failed",
      });

    } finally {
      setIsUploadingFile(false);
      focusRef?.current?.focus();
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
        className={`input-group`}
        style={{
          backgroundColor: dark ? '#212529' : 'white',
          position: 'sticky',
          bottom: '0',
        }}
      >

        {file && (
          <div
            className="file-preview"
            style={{
              position: "absolute",
              left: "6px",
              top: "-45px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              zIndex: 10,
              background: dark ? "#343a40" : "#6c757d",
              padding: "4px 8px",
              borderRadius: "8px",
              maxWidth: "80%",
            }}
          >
            {/* {file.mimeType.startsWith("image/") && (
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderRadius: "6px",
                }}
              >
                Image
              </span>
            )} */}

            <span
              className="text-light"
              style={{
                fontSize: "12px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file.name}
            </span>

            {!inputMessage._id && <button
              type="button"
              aria-label="Remove file"
              onClick={() => setFile(null)}
              style={{
                width: "22px",
                height: "22px",
                border: "none",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>}
          </div>
        )}

        {!file &&
          <label className="upload-btn"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.currentTarget.querySelector("input")?.click();
              }
            }}>
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
            />
            <span className=''>+</span>
          </label>
        }
        <textarea
          id='input'
          ref={focusRef}
          placeholder={`${!activeContact ? 'Select a contact to start chatting' : 'Type your message here...'}`}
          value={inputMessage.msg || ''}
          className={`form-control btn-outline-light ${dark ? 'text-light bg-dark' : 'text-dark bg-light'}`}
          onChange={handleTextAreaUpdate}
          onKeyDown={handleKeyDown}
          aria-label="Your message"
          aria-describedby="button-addon2"
          disabled={!activeContact}
          style={{ maxHeight: '180px', resize: 'none', overflowY: 'auto', scrollbarWidth: 'none' }}
        ></textarea>

        <button
          className={`btn btn-light `}
          type="button" id="button-addon2"
          onClick={handleSend}
          style={{ cursor: `${(!(inputMessage.msg.trim() || file) || !activeContact || isUploadingFile) ? 'not-allowed' : 'pointer'}` }}
          title={!activeContact ? 'Select a contact to start chatting' : (isUploadingFile ? 'Please wait for the image to finish uploading' : (!inputMessage.msg.trim() ? 'Enter a message to send' : 'Send message'))}
        >{isUploadingFile ? <CircularProgress color="secondary" aria-label="Loading…" /> : (inputMessage._id ? <EditIcon /> : <SendIcon />)}</button>
      </form>
    </div>
  )
}