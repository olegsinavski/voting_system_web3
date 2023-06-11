import { useState, useEffect } from 'react';

/**
 * Custom hook that manages a disappearing error message.
 * The error message will be cleared after a specified timeout.
 * 
 * @param {number} timeout - The duration in milliseconds before the error message disappears. Default is 3000 milliseconds.
 * @returns {Array} - An array containing the error message and a function to set the error message.
 */
export function useDisappearingError(timeout = 3000) {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Set a timer to clear the error message after the specified timeout
    const timer = setTimeout(() => {
      setErrorMessage("");
    }, timeout);

    // Cleanup function to cancel the timer if the component unmounts or the error message changes
    return () => {
      clearTimeout(timer);
    };
  }, [errorMessage, timeout]);

  return [errorMessage, setErrorMessage];
}

/**
 * Component that displays an error popup.
 * 
 * @param {string} errorMessage - The error message to display in the popup.
 * @returns {JSX.Element|null} - The JSX element representing the error popup or null if there is no error message.
 */
export const ErrorPopup = ({ errorMessage }) => {
  return (
    errorMessage && (
      <div className="error-popup">
        <p>{errorMessage}</p>
      </div>
    )
  );
};
