import type { Alert as AlertType } from './types/alert'

type AlertProps = {
  alert: AlertType | null
};

export default function Alert({ alert }: AlertProps) {
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