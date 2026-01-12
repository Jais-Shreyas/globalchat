import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="container-fluid px-0" style={{ minHeight: "100vh" }}>
      <div className="row g-0 align-items-center" style={{ minHeight: "100vh" }}>
        <div className="col-md-6 text-center">
          <img
            src="/android-chrome-512x512.png"
            alt="Global Chat"
            className="img-fluid p-4"
            style={{ maxWidth: "400px", borderRadius: "20%" }}
          />
        </div>
        <div className="col-md-6 text-center text-md-start">
          <h1 className="fw-bold mb-3">Global Chat</h1>
          <p className="text-muted mb-4">
            A real-time global chat platform where conversations happen instantly
            and securely.
          </p>

          <div className="d-flex gap-3 justify-content-center justify-content-md-start">
            <Link to="/signup" className="btn btn-success px-4">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline-primary px-4">
              Login
            </Link>
          </div>
        </div>
        

      </div>
    </div>
  );
}
