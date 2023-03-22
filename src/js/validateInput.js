const showError = message => {
    const errorContainer = document.querySelector('#error');
    errorContainer.innerHTML = "";

    const messageStrip = document.createElement('ui5-message-strip');
    messageStrip.setAttribute('design', 'Negative');
    messageStrip.innerHTML = message;
    messageStrip.addEventListener('close', () => errorContainer.removeChild(messageStrip));

    errorContainer.appendChild(messageStrip);
}

const validInput = (loanAmount, interestRate, loanTerm) => {
    const errorContainer = document.querySelector('#error');
    errorContainer.innerHTML = "";

    let inputIsValid = true;

    if (!loanAmount || !interestRate || !loanTerm) {
        inputIsValid = false;
        showError("Invalid input");
    }

    return inputIsValid;
}

const validateAdditionalPayments = (loanTerm, allPayments) => {
    let paymentsValid = true;
    const errorContainer = document.querySelector('#error');
    errorContainer.innerHTML = "";

    const rows = document.querySelectorAll("#extraPaymentsTable ui5-table-row")
    rows.forEach(row => row.querySelectorAll("ui5-input").forEach(element => element.removeAttribute("value-state")));

    allPayments.forEach((payment, index, array) => {
        const month = payment[0];
        if (loanTerm < month) {
            rows[index].querySelectorAll("ui5-input")[0].setAttribute("value-state", "Error");
            showError("Additional payment month must be less than the loan term (months).");
            paymentsValid = false;
        }
    });

    return paymentsValid
};

export {
    validInput,
    validateAdditionalPayments
}