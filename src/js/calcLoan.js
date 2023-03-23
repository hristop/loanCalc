import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";

import moment from 'moment';

export function setUpCalc(element) {
    const calcLoanData = (loanData, includeAddPayments) => {
        // Calculate monthly payment
        let startMonth = moment(loanData.basicInfo.startMonth, "MM/YYYY");
        const monthlyInterestRate = loanData.basicInfo.interestRate / 12;
        let monthlyPayment =
            (loanData.basicInfo.loanAmount * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -loanData.basicInfo.loanTerm));

        let remainingPrincipal = loanData.basicInfo.loanAmount;
        let totalInterestPaid = 0;

        for (let index = 1; index <= loanData.basicInfo.loanTerm; index++) {
            let bLastMonth = false;
            let addMonthPayment = 0; // Used for the month with additional payment
            const currentMonth = startMonth.add(1, 'M');

            //Gather additional payments and substract them from the remaining balance
            includeAddPayments && loanData.additionalPayments.forEach((payment) => {
                if (payment[0] === index) {
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

            if (includeAddPayments) {
                loanData.allPaymentsData.perMonth.push({
                    index,
                    currentMonth: currentMonth.format("MM/YYYY"),
                    monthlyPayment,
                    addMonthPayment,
                    principalPaid,
                    interestPaid,
                    totalInterestPaid,
                    remainingPrincipal
                });
            } else {
                loanData.noAddPaymentsData.perMonth.push({
                    index,
                    currentMonth: currentMonth.format("MM/YYYY"),
                    monthlyPayment,
                    addMonthPayment,
                    principalPaid,
                    interestPaid,
                    totalInterestPaid,
                    remainingPrincipal
                });
            }

            // Line chart data
            includeAddPayments && loanData.lineChartData.push([
                index,
                remainingPrincipal,
                totalInterestPaid
            ]);

            if (bLastMonth) {
                // Extract total interest
                includeAddPayments ?
                    loanData.allPaymentsData.totalInterestPaid = totalInterestPaid :
                    loanData.noAddPaymentsData.totalInterestPaid = totalInterestPaid;

                // Pie chart data
                includeAddPayments && loanData.pieChartData.push(["Principal", loanData.basicInfo.loanAmount]);
                includeAddPayments && loanData.pieChartData.push(["Interest", totalInterestPaid]);
                break;
            }
        }
    }

    const generateAdditionalInformation = loanData => {
        const info = document.getElementById('info');

        loanData.allPaymentsData.currentTotalPayment = loanData.basicInfo.loanAmount + loanData.allPaymentsData.totalInterestPaid;

        let infoHtml = `
            <div>
                <ui5-badge color-scheme="6">Total payment: ${(loanData.allPaymentsData.currentTotalPayment).toFixed(2)}</ui5-badge>
                <br>
                <ui5-badge color-scheme="1">Interest: ${(loanData.allPaymentsData.totalInterestPaid).toFixed(2)}</ui5-badge>
                <br>
            </div>
        `;

        if (loanData.additionalPayments.length) {
            infoHtml += `
                <div>
                    <ui5-badge color-scheme="5">Initial total payment: ${(loanData.basicInfo.loanAmount + loanData.noAddPaymentsData.totalInterestPaid).toFixed(2)}</ui5-badge>
                    <br>
                    <ui5-badge color-scheme="8">Interest saved: ${(loanData.noAddPaymentsData.totalInterestPaid - loanData.allPaymentsData.totalInterestPaid).toFixed(2)}</ui5-badge>
                    <br>
                </div>
            `;
        }

        info.innerHTML = infoHtml;
    }

    const calculate = () => {
        // Get input values
        const startDate = moment(document.getElementById("startDate").value, "DD/MM/YYYY");
        //const startDate = document.getElementById("startDate").value;
        const loanAmount = Number.parseFloat(document.getElementById("loanAmount").value);
        const interestRate = Number.parseFloat(document.getElementById("interestRate").value) / 100;
        const loanTerm = Number.parseFloat(document.getElementById("loanTerm").value);

        // Gather additional payments
        const additionalPayments = gatherAdditionalPayments();

        if (!validInput(loanAmount, interestRate, loanTerm) || !validateAdditionalPayments(loanTerm, additionalPayments)) {
            return;
        }

        const startMonth = startDate.format('MM/YYYY');
        let lineChartData = [
            ["Month", "Principal", "Interest"],
            [0, loanAmount, 0],
        ];
        let pieChartData = [
            ["Principal", "Interest"]
        ];

        // Show all sections
        document.querySelectorAll('ui5-panel.hidden').forEach(panel => panel.classList.remove('hidden'));

        const allPaymentsData = {
            basicInfo: {
                startMonth,
                loanAmount,
                interestRate,
                loanTerm
            },
            additionalPayments,
            noAddPaymentsData: {
                perMonth: []
            },
            allPaymentsData: {
                perMonth: []
            },
            lineChartData,
            pieChartData
        }

        additionalPayments.length && calcLoanData(allPaymentsData, false);
        calcLoanData(allPaymentsData, true);

        generateAdditionalInformation(allPaymentsData);

        // Render the per month table
        let tableHtml = allPaymentsData.allPaymentsData.perMonth.reduce((tableHtml, rowData) => {
            return tableHtml += renderMonthTableRow(rowData);
        }, renderMonthTableStart({
            startMonth,
            loanAmount
        }));
        tableHtml += renderMonthTableEnd();
        document.getElementById("table").innerHTML = tableHtml;

        // Charts
        drawLineChart(allPaymentsData.lineChartData);
        drawPieChart(allPaymentsData.pieChartData);
    }

    element.addEventListener('click', () => calculate());
}
