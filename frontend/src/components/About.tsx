import { useTheme } from "../contexts/ThemeContext";

export default function About() {
  const { dark } = useTheme();
  return (
    <div className={`p-2 d-flex flex-column justify-content-center align-items-center ${dark ? 'text-light' : 'text-dark'}`}>
      <h1 style={{ textDecoration: 'underline' }}>About Us</h1>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        This is a chat application built using React, Express and Node.js.
        <br />
        You can chat with your friends in real-time.
        <br />
        To add contacts, click on + icon on the left panel and enter their username.
        <br />
        You can also visit someone's profile by clicking on their name in the chat window.
        <br />
        Designed with ❤️ by - Shreyas Jaiswal
      </div>
    </div>
  )
}