import { useState, useEffect } from 'react';

export function useDisappearingError(timeout=3000) {
    const [errorMessage, setErrorMessage] = useState("");
    useEffect(() => {
      console.log("trigger error effect", errorMessage);
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, timeout);
  
      return () => {
        clearTimeout(timer);
      };
    }, [errorMessage]);

    return [errorMessage, setErrorMessage];
}