import moment from "moment";

const renderMonthTableStart = (data) => {
    return `
        <ui5-table sticky-column-header>
            <!-- Columns -->
            <ui5-table-column class="table-header-text-alignment" slot="columns">
                <ui5-label>Month</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns" min-width="600" popin-text="Date" demand-popin>
                <ui5-label>Date</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns">
                <ui5-label>Payment</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns">
                <ui5-label>Principal</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns">
                <ui5-label>Interest</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns"  min-width="600" popin-text="Date" demand-popin>
                <ui5-label>Total Interest Paid</ui5-label>
            </ui5-table-column>

            <ui5-table-column class="table-header-text-alignment" slot="columns">
                <ui5-label>Remaining Principal</ui5-label>
            </ui5-table-column>

            <!-- Rows -->

            <ui5-table-row>
                <ui5-table-cell>
                    <span><b>0</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${moment(data.startDate, 'DD/MM/YYYY').format('MM/YYYY')}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>-</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>-</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>-</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>0</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${data.loanAmount.toFixed(2)}</b></span>
                </ui5-table-cell>
            </ui5-table-row>
    `;
}

const renderMonthTableRow = data => {
    const currentMonth = moment().format('MM/YYYY');
    const bMark = currentMonth === moment(data.month, 'DD/MM/YYYY').format('MM/YYYY');
    return `
        <ui5-table-row ${bMark ? 'navigated' : ''}>
            <ui5-table-cell>
                <span><b>${data.index}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${moment(data.month, 'DD/MM/YYYY').format('MM/YYYY')}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${data.monthlyPayment.toFixed(2)}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${data.monthlyPrincipal.toFixed(2)}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${data.monthlyInterest.toFixed(2)}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${data.totalMonthlyInterest.toFixed(2)}</b></span>
            </ui5-table-cell>
            <ui5-table-cell>
                <span><b>${data.remainingPrincipal.toFixed(2)}</b></span>
            </ui5-table-cell>
        </ui5-table-row>
    `;
}

const renderMonthTableEnd = () => {
    return '</ui5-table>';
}

export {
    renderMonthTableStart,
    renderMonthTableRow,
    renderMonthTableEnd
}