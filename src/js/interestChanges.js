const gatherInterestChanges = () => {
    const interestChanges = [];
    const interestChangesRows = document.querySelectorAll('#interestChangesTable ui5-table-row');

    interestChangesRows.forEach((row) => {
        const inputs = row.querySelectorAll('ui5-input');
        const recalculateSwitch = row.querySelector('ui5-switch');

        const month = Number.parseFloat(inputs[0].value);
        const newMonthly = Number.parseFloat(inputs[1].value) || 0;
        const recalculatePayment = recalculateSwitch.getAttribute('checked') === '';

        interestChanges.push([month, newMonthly, recalculatePayment]);
    });

    return interestChanges;
}

function setUpInterestChanges (addInterestChangesButton) {
    const addTable = () => {
        const containerDom = document.querySelector('#interestChanges');
        containerDom.innerHTML = `
            <ui5-table id="interestChangesTable">
                <!-- Columns -->
                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>Increase month number</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="600" popin-text="Payment amount" demand-popin>
                    <ui5-label>New Interest</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="400" popin-text="Recalculate payment" demand-popin>
                    <ui5-label>Recalculate Payment</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="400" popin-text="Delete row" demand-popin>
                    <ui5-label>Delete row</ui5-label>
                </ui5-table-column>
            </ui5-table>
        `;
    }

    const addInterestChange = () => {
        const containerDom = document.querySelector('#interestChanges');
        const deleteRow = (row) => {
            const table = document.querySelector('#interestChangesTable');
            table.removeChild(row);

            if (table.querySelectorAll('ui5-table-row').length === 0) {
                document.getElementById('interestChanges').innerHTML = '';
            }

            setTimeout(() => addInterestChangesButton.focus(), 100);
        }

        if (!containerDom.innerHTML) {
            addTable();
        }

        const table = document.querySelector('#interestChangesTable');
        const row = document.createElement('ui5-table-row');

        ['Enter month number', 'Enter new interest rate'].forEach(value => {
            const cell = document.createElement('ui5-table-cell')
            const input = document.createElement('ui5-input');
            input.setAttribute('placeholder', value);
            cell.appendChild(input);
            row.appendChild(cell);
        });

        const cell = document.createElement('ui5-table-cell')
        const recalculateSwitch = document.createElement('ui5-switch');
        recalculateSwitch.setAttribute('text-on', 'Yes');
        recalculateSwitch.setAttribute('text-off', 'No');
        cell.appendChild(recalculateSwitch);
        row.appendChild(cell);


        const cellDel = document.createElement('ui5-table-cell')
        const button = document.createElement('ui5-button');
        button.setAttribute('icon', 'delete');
        button.addEventListener('click', () => deleteRow(row));
        cellDel.appendChild(button);
        row.appendChild(cellDel);

        table.appendChild(row);

        setTimeout(() => row.focus(), 100);
    };

    addInterestChangesButton && addInterestChangesButton.addEventListener('click', () => addInterestChange());
};

export {
    setUpInterestChanges,
    gatherInterestChanges
}