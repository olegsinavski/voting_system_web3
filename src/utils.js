
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

export async function makeTransaction(transaction, setLoading, setErrorMessage) {
    return makeOperation(async () => {
        const tx = await transaction();
        return await tx.wait();
    }, setLoading, setErrorMessage);
}

