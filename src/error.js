import { useState, useEffect } from 'react';

export function useDisappearingError(timeout=3000) {
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, timeout);
  
      return () => {
        clearTimeout(timer);
      };
    }, [errorMessage, timeout]);

    return [errorMessage, setErrorMessage];
}

export const ErrorPopup = ({ errorMessage }) => {
  return (
    errorMessage && (
      <div className="error-popup">
        <p>{errorMessage}</p>
      </div>
    )
  );
};