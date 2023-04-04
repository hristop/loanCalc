const gatherAdditionalPayments = () => {
    const additionalPayments = [];
    const additionalPaymentRows = document.querySelectorAll("#extraPaymentsTable ui5-table-row");

    additionalPaymentRows.forEach((row, index) => {
        const month = Number.parseFloat(row.querySelectorAll("ui5-input")[0].value);
        const ammount = Number.parseFloat(row.querySelectorAll("ui5-input")[1].value);
        const newMonthly = Number.parseFloat(row.querySelectorAll("ui5-input")[2].value) || 0;

        additionalPayments.push([month, ammount, newMonthly]);
    });

    return additionalPayments;
}

function setUpExtraPayments (addExtraPaymentsButton) {
    const addTable = () => {
        const containerDom = document.querySelector('#extraPayments');
        containerDom.innerHTML = `
            <ui5-table id="extraPaymentsTable">
                <!-- Columns -->
                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>Payment month number</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="600" popin-text="Payment amount" demand-popin>
                    <ui5-label>Payment amount</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="600" popin-text="New monthly payment" demand-popin>
                    <ui5-label>New monthly payment</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="400" popin-text="Delete row" demand-popin>
                    <ui5-label>Delete row</ui5-label>
                </ui5-table-column>
            </ui5-table>
        `;
    }

    const addExtraPayment = () => {
        const containerDom = document.querySelector('#extraPayments');
        const deleteRow = (row) => {
            const table = document.querySelector('#extraPaymentsTable');
            table.removeChild(row);

            if (table.querySelectorAll('ui5-table-row').length === 0) {
                document.getElementById('extraPayments').innerHTML = '';
            }

            setTimeout(() => document.getElementById("addExtraPayment").focus(), 100);
        }

        if (!containerDom.innerHTML) {
            addTable();
        }

        const table = document.querySelector('#extraPaymentsTable');
        const row = document.createElement('ui5-table-row');

        ['Enter month number', 'Enter ammount', 'Adjust payment'].forEach(value => {
            const cell = document.createElement('ui5-table-cell')
            const input = document.createElement('ui5-input');
            input.setAttribute('placeholder', value);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        const cell = document.createElement('ui5-table-cell')
        const button = document.createElement('ui5-button');
        button.setAttribute('icon', 'delete');
        button.addEventListener('click', () => deleteRow(row));
        cell.appendChild(button);
        row.appendChild(cell);

        table.appendChild(row);

        setTimeout(() => row.focus(), 100);
    };

    addExtraPaymentsButton && addExtraPaymentsButton.addEventListener('click', () => addExtraPayment());
};

export {
    setUpExtraPayments,
    gatherAdditionalPayments
}