export function StatusMessage({ children, success = false }) {
  if (!children) {
    return null;
  }

  return (
    <div className={success ? 'auth-alert success show' : 'auth-alert show'}>
      {children}
    </div>
  );
}

export function ToastMessage({ children, success = false, onClose }) {
  if (!children) {
    return null;
  }

  return (
    <div className={success ? 'toast-message success' : 'toast-message'} role="status">
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose}>
          x
        </button>
      )}
    </div>
  );
}
