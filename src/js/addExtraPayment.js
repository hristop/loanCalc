export function setUpExtraPayments (elementsMap) {
    const addTable = () => {
        const containerDom = document.querySelector('#extraPayments');
        containerDom.innerHTML = `
            <ui5-table id="extraPaymentsTable">
                <!-- Columns -->
                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>Payment month number</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>Payment ammount</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>New monthly payment</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns">
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
    };

    elementsMap.extraPaymentsAddButton && elementsMap.extraPaymentsAddButton.addEventListener('click', () => addExtraPayment());
};