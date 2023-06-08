import { validateAddress } from './utils';
import { useState } from 'react';

/**
 * CandidateForm component renders a form to add a candidate.
 * @param {string} label - The label for the form input.
 * @param {string} buttonLabel - The label for the form submit button.
 * @param {Array} signers - The list of signers to be displayed as options in the input.
 * @param {function} setErrorMessage - A function to set an error message.
 * @param {function} onAsyncUpdate - A function to handle the async update when adding a candidate.
 */
export function CandidateForm({
  label,
  buttonLabel,
  signers,
  setErrorMessage,
  onAsyncUpdate
}) {
  const [candidateInputValue, setCandidateInputValue] = useState('');

  /**
   * Handles the change event for the candidate input.
   * @param {object} event - The change event object.
   */
  const handleCandidateInputChange = (event) => {
    setCandidateInputValue(event.target.value);
  };

  /**
   * Handles the submit event when adding a candidate.
   * @param {object} event - The submit event object.
   */
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
        <input className="form-input" type="text" list="candidateAddresses" value={candidateInputValue} onChange={handleCandidateInputChange} />
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
