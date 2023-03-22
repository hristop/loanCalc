import { validInput, validateAdditionalPayments } from "./validateInput";
import moment from 'moment';

export function setUpCalc(element) {
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

    const drawLineChart = lineChartData => {
        var data = google.visualization.arrayToDataTable(lineChartData);

        var options = {
            title: "Loan Payment Schedule",
            curveType: "function",
            legend: {
                position: "right",
                alignment: "center"
            },
            hAxis: { title: "Month" },
            vAxis: { title: "Amount" },
            width: 600
        };

        var chart = new google.visualization.LineChart(
            document.getElementById("lineChart")
        );
        chart.draw(data, options);
    }

    const drawPieChart = pieChartData => {
        var data = google.visualization.arrayToDataTable(pieChartData);

        var options = {
            title: "Loan Payment",
            legend: {
                position: "right",
                alignment: "center"
            },
            width: 500,
            pieSliceText: 'value'
        };

        var chart = new google.visualization.PieChart(
            document.getElementById("pieChart")
        );
        chart.draw(data, options);
    }

    const renderMonthTableStart = (data) => {
        return `
            <ui5-table>
                <!-- Columns -->
                <ui5-table-column class="table-header-text-alignment" slot="columns">
                    <ui5-label>Month</ui5-label>
                </ui5-table-column>

                <ui5-table-column class="table-header-text-alignment" slot="columns">
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

                <ui5-table-column class="table-header-text-alignment" slot="columns">
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
                        <span><b>${data.startDate.format("MM/YYYY")}</b></span>
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
        return `
            <ui5-table-row>
                <ui5-table-cell>
                    <span><b>${data.i}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${data.currentMonth.format("MM/YYYY")}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${(data.monthlyPayment + data.addMonthPayment).toFixed(2)}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${data.principalPaid.toFixed(2)}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${data.interestPaid.toFixed(2)}</b></span>
                </ui5-table-cell>
                <ui5-table-cell>
                    <span><b>${data.totalInterestPaid.toFixed(2)}</b></span>
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

    const calculate = () => {
        // Get input values
        const startDate = moment(document.getElementById("startDate").value, "DD/MM/YYYY");
        const loanAmount = Number.parseFloat(document.getElementById("loanAmount").value);
        const interestRate = Number.parseFloat(document.getElementById("interestRate").value) / 100;
        const loanTerm = Number.parseFloat(document.getElementById("loanTerm").value);

        // Gather additional payments
        const additionalPayments = gatherAdditionalPayments();

        let lineChartData = [
            ["Month", "Principal", "Interest"],
            [0, loanAmount, 0],
        ];
        let pieChartData = [
            ["Principal", "Interest"]
        ];

        if (!validInput(loanAmount, interestRate, loanTerm) || !validateAdditionalPayments(loanTerm, additionalPayments)) {
            return;
        }

        // Show all sections
        document.querySelectorAll('section.hidden').forEach(section => section.classList.remove('hidden'));

        // Calculate monthly payment
        const monthlyInterestRate = interestRate / 12;
        let monthlyPayment =
            (loanAmount * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));

        let tableHtml = renderMonthTableStart({
            startDate,
            loanAmount
        });

        let remainingPrincipal = loanAmount;
        let totalInterestPaid = 0;

        // Calculate table values
        for (let i = 1; i <= loanTerm; i++) {
            let bLastMonth = false;
            let addMonthPayment = 0; // Used for the month with additional payment
            const currentMonth = startDate.add(1, 'M');

            //Gather additional payments and substract them from the remaining balance
            additionalPayments.forEach((payment) => {
                if (payment[0] === i) {
                    if(!isNaN(payment[1])) {
                        // the amount that was payed additionally
                        addMonthPayment += payment[1];
                    }

                    if (payment[2]) {
                        // new monthly payment if such arrangement was made
                        monthlyPayment = payment[2];
                    }
                }
            });

            const interestPaid = remainingPrincipal * monthlyInterestRate;
            let principalPaid = monthlyPayment + addMonthPayment - interestPaid;
            remainingPrincipal -= principalPaid;
            totalInterestPaid += interestPaid;

            if (remainingPrincipal <= 0 || Number.parseFloat((remainingPrincipal * 100).toFixed(2)) == 0 ) {
                // the monthly payment is more than the actual amount of loan left
                bLastMonth = true;
                monthlyPayment = remainingPrincipal + principalPaid;
                principalPaid = monthlyPayment + addMonthPayment - interestPaid
                remainingPrincipal = 0;
            }

            tableHtml += renderMonthTableRow({
                i,
                currentMonth,
                monthlyPayment,
                addMonthPayment,
                principalPaid,
                interestPaid,
                totalInterestPaid,
                remainingPrincipal
            });

            // Line chart data
            lineChartData.push([
                i,
                remainingPrincipal,
                totalInterestPaid
            ]);

            if (bLastMonth) {
                // Pie chart data
                pieChartData.push(["Principal", loanAmount]);
                pieChartData.push(["Interest", totalInterestPaid]);
                break;
            }
        }

        // End and flush ui5-table
        tableHtml += renderMonthTableEnd();
        document.getElementById("table").innerHTML = tableHtml;

        drawLineChart(lineChartData);
        drawPieChart(pieChartData);
    }

    element.addEventListener('click', () => calculate());
}
