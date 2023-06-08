import { ethers } from 'ethers';

/**
 * Validates an Ethereum address.
 * 
 * @param {string} address - The address to validate.
 * @returns {boolean} - True if the address is valid, false otherwise.
 */
export function validateAddress(address) {
    try {
        ethers.utils.getAddress(address);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Converts an Ethereum transaction error to a human-readable message.
 * 
 * @param {object} error - The error object to convert.
 * @returns {string} - The human-readable error message.
 */
export function txErrorToHumanReadable(error) {
    let message;

    if (error.error && error.error.error && error.error.error.data && error.error.error.data.message) {
        // If the error object has a nested 'message' property, extract the error message
        message = error.error.error.data.message;
        return message.split("reverted with reason string '")[1].slice(0, -1);
    } else if (error.reason) {
        // If the error object has a 'reason' property, use it as the error message
        return error.reason;
    } else {
        // Otherwise, stringify the entire error object
        return JSON.stringify(error);
    }
}

/**
 * Executes an asynchronous operation and handles loading state and error messages.
 * 
 * @param {function} operation - The asynchronous operation to execute.
 * @param {function} setLoading - A function to set the loading state.
 * @param {function} setErrorMessage - A function to set the error message.
 * @returns {Promise<any>} - The result of the operation.
 */
export async function makeOperation(operation, setLoading, setErrorMessage) {
    setLoading(true);
    try {
        const result = await operation();
        setLoading(false);
        return result;
    } catch (error) {
        setLoading(false);
        console.log(error);
        setErrorMessage(txErrorToHumanReadable(error));
    }
}

/**
 * Executes an Ethereum transaction and handles loading state and error messages.
 * 
 * @param {function} transaction - The Ethereum transaction to execute.
 * @param {function} setLoading - A function to set the loading state.
 * @param {function} setErrorMessage - A function to set the error message.
 * @returns {Promise<any>} - The result of the transaction.
 */
export async function makeTransaction(transaction, setLoading, setErrorMessage) {
    return makeOperation(async () => {
        const tx = await transaction();
        return await tx.wait();
    }, setLoading, setErrorMessage);
}
