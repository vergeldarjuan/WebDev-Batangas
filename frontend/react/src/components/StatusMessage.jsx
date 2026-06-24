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
