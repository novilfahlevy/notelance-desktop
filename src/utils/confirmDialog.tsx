import { confirmAlert } from 'react-confirm-alert'
import { AlertTriangle } from 'lucide-react'
import 'react-confirm-alert/src/react-confirm-alert.css'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel?: () => void
}

export const showConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
}: ConfirmDialogOptions) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className="custom-confirm-ui">
          <div className="custom-confirm-title">
            <div className="custom-confirm-icon">
              <AlertTriangle size={24} />
            </div>
            <span>{title}</span>
          </div>
          <div className="custom-confirm-message">{message}</div>
          <div className="custom-confirm-buttons">
            <button
              className="custom-confirm-button custom-confirm-button-cancel"
              onClick={() => {
                if (onCancel) onCancel()
                onClose()
              }}
            >
              {cancelLabel}
            </button>
            <button
              className="custom-confirm-button custom-confirm-button-delete"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )
    },
    overlayClassName: 'custom-confirm-overlay',
  })
}