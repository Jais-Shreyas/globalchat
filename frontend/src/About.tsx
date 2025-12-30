export default function About({ dark }) {
  return (
    <div className={`container ${dark ? 'text-light' : 'text-dark'}`}>
      <h1>About Us</h1>
      <p>
        This is a chat application built using React, Express and Node.js.
        <br />
        Designed by - Shreyas Jaiswal
      </p>
    </div>
  )
}