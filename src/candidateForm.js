import { validateAddress } from './utils';
import { useState } from 'react';

export function CandidateForm({
  label,
  buttonLabel,
  signers,
  setErrorMessage,
  onAsyncUpdate
}) {
  const [candidateInputValue, setCandidateInputValue] = useState('');

  async function handleAddCandidateSubmit(event) {
      event.preventDefault();
      if (!validateAddress(candidateInputValue)) {
          setErrorMessage('Invalid candidate address - should be full address');
          return;
      }
      await onAsyncUpdate(candidateInputValue);
  };

  return (
        <div className="form-container">
          <form onSubmit={handleAddCandidateSubmit}>
              <label className="form-label">
              {label}
              </label>
              <input className="form-input" type="text" list="candidateAddresses" value={candidateInputValue} onChange={setCandidateInputValue} />
              <datalist id="candidateAddresses">
                {signers.map(s => 
                    <option key={s} value={s}>{s}</option>
                )}
              </datalist>
              <button className="action-button" type="submit">{buttonLabel}</button>
          </form>
        </div>
  );
}
