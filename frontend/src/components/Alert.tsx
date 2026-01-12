import { useAlert } from "../contexts/AlertContext";

export default function Alert() {
  const { alert } = useAlert();
  if (!alert) return null;
  return (
    <>
      <div style={{ height: '0rem', zIndex: '1000' }}>
        <div style={{ maxWidth: '600px' }} className={`mx-auto text-center alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      </div>
    </>
  )
}