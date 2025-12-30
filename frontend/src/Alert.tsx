export default function Alert({ alert }) {
  return (
    <div style={{ height: '0rem', zIndex: '1000' }}>
      <>
        {alert &&
          <div style={{ maxWidth: 'auto' }} className={`text-center alert alert-${alert.type}`} role="alert">
            {alert.message}
          </div>}
      </>
    </div>
  )
}