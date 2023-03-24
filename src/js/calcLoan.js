import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";

import moment from 'moment';

export function setUpCalc(element) {
    const calcLoanData = (loanData, includeAddPayments, isFixedPrincipal) => {
        // Calculate monthly payment
        let startMonth = moment(loanData.basicInfo.startMonth, "MM/YYYY");
        // Calculate the monthly interest rate
        const monthlyInterestRate = loanData.basicInfo.interestRate / 12;

        if (isFixedPrincipal) {
            // Fixed principal payment (varying monthly)
            let totalMonthlyInterest = 0;
            let fixedPrincipalPayment = loanData.basicInfo.loanAmount / loanData.basicInfo.loanTerm;

            // Initialize balance to loan amount
            let remainingPrincipal = loanData.basicInfo.loanAmount;

            for (let index = 1; index <= loanData.basicInfo.loanTerm; index++) {
                const currentMonth = startMonth.add(1, 'M');
                let addMonthPayment = 0;

                // Calculate interest for this month
                const monthlyInterest = remainingPrincipal * monthlyInterestRate;

                // Calculate principal for this month
                let monthlyPrincipal = fixedPrincipalPayment;

                includeAddPayments && loanData.additionalPayments.forEach((payment) => {
                    if (payment[0] === index) {
                        if(!isNaN(payment[1])) {
                            // the amount that was payed additionally
                            addMonthPayment += payment[1];
                        }

                        if (payment[2]) {
                            // new monthly payment if such arrangement was made
                            fixedPrincipalPayment = payment[2];
                        }
                    }
                });

                // Calculate monthly payment for this month
                const monthlyPayment = monthlyInterest + monthlyPrincipal + addMonthPayment;

                // Update balance for next month
                remainingPrincipal -= (monthlyPrincipal + addMonthPayment);
                totalMonthlyInterest += monthlyInterest;

                // Log payment details for this month
                loanData.allPaymentsData.perMonth.push({
                    index,
                    currentMonth: currentMonth.format("MM/YYYY"),
                    monthlyPayment,
                    addMonthPayment,
                    monthlyPrincipal,
                    monthlyInterest,
                    totalMonthlyInterest,
                    remainingPrincipal
                });

                // Line chart data
                includeAddPayments && loanData.lineChartData.push([
                    index,
                    remainingPrincipal,
                    totalMonthlyInterest
                ]);

                // If balance is zero or negative, break out of loop
                if (remainingPrincipal <= 0) {
                    // Extract total interest
                    includeAddPayments ?
                        loanData.allPaymentsData.totalInterest = totalMonthlyInterest :
                        loanData.noAddPaymentsData.totalInterest = totalMonthlyInterest;

                    // Pie chart data
                    includeAddPayments && loanData.pieChartData.push(["Principal", loanData.basicInfo.loanAmount]);
                    includeAddPayments && loanData.pieChartData.push(["Interest", loanData.allPaymentsData.totalInterest]);
                    break;
                }
            }
        } else {
            // Fixed monthly payment
            let monthlyPayment =
                (loanData.basicInfo.loanAmount * monthlyInterestRate) /
                (1 - Math.pow(1 + monthlyInterestRate, -loanData.basicInfo.loanTerm));

            let remainingPrincipal = loanData.basicInfo.loanAmount;
            let totalMonthlyInterest = 0;

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

                const monthlyInterest = remainingPrincipal * monthlyInterestRate;
                let monthlyPrincipal = monthlyPayment + addMonthPayment - monthlyInterest;
                remainingPrincipal -= monthlyPrincipal;
                totalMonthlyInterest += monthlyInterest;

                if (remainingPrincipal <= 0 || Number.parseFloat((remainingPrincipal * 100).toFixed(2)) == 0 ) {
                    // the monthly payment is more than the actual amount of loan left
                    bLastMonth = true;
                    monthlyPayment = remainingPrincipal + monthlyPrincipal;
                    monthlyPrincipal = monthlyPayment + addMonthPayment - monthlyInterest
                    remainingPrincipal = 0;
                }

                if (includeAddPayments) {
                    loanData.allPaymentsData.perMonth.push({
                        index,
                        currentMonth: currentMonth.format("MM/YYYY"),
                        monthlyPayment,
                        addMonthPayment,
                        monthlyPrincipal,
                        monthlyInterest,
                        totalMonthlyInterest,
                        remainingPrincipal
                    });
                } else {
                    loanData.noAddPaymentsData.perMonth.push({
                        index,
                        currentMonth: currentMonth.format("MM/YYYY"),
                        monthlyPayment,
                        addMonthPayment,
                        monthlyPrincipal,
                        monthlyInterest,
                        totalMonthlyInterest,
                        remainingPrincipal
                    });
                }

                // Line chart data
                includeAddPayments && loanData.lineChartData.push([
                    index,
                    remainingPrincipal,
                    totalMonthlyInterest
                ]);

                if (bLastMonth) {
                    // Extract total interest
                    includeAddPayments ?
                        loanData.allPaymentsData.totalInterest = totalMonthlyInterest :
                        loanData.noAddPaymentsData.totalInterest = totalMonthlyInterest;

                    // Pie chart data
                    includeAddPayments && loanData.pieChartData.push(["Principal", loanData.basicInfo.loanAmount]);
                    includeAddPayments && loanData.pieChartData.push(["Interest", loanData.allPaymentsData.totalInterest]);
                    break;
                }
            }
        }
    }

    const generateAdditionalInformation = loanData => {
        const info = document.getElementById('info');

        loanData.allPaymentsData.currentTotalPayment = loanData.basicInfo.loanAmount + loanData.allPaymentsData.totalInterest;

        let infoHtml = `
            <div>
                <ui5-badge color-scheme="6">Total payment: ${(loanData.allPaymentsData.currentTotalPayment).toFixed(2)}</ui5-badge>
                <br>
                <ui5-badge color-scheme="1">Interest: ${(loanData.allPaymentsData.totalInterest).toFixed(2)}</ui5-badge>
                <br>
            </div>
        `;

        if (loanData.additionalPayments.length) {
            infoHtml += `
                <div>
                    <ui5-badge color-scheme="5">Initial total payment: ${(loanData.basicInfo.loanAmount + loanData.noAddPaymentsData.totalInterest).toFixed(2)}</ui5-badge>
                    <br>
                    <ui5-badge color-scheme="8">Interest saved: ${(loanData.noAddPaymentsData.totalInterest - loanData.allPaymentsData.totalInterest).toFixed(2)}</ui5-badge>
                    <br>
                </div>
            `;
        }

        info.innerHTML = infoHtml;
    }

    const calculate = () => {
        // Get input values
        const tableDiv = document.getElementById("table");
        tableDiv.innerHTML = '';

        const startDate = moment(document.getElementById("startDate").value, "DD/MM/YYYY");
        //const startDate = document.getElementById("startDate").value;
        const loanAmount = Number.parseFloat(document.getElementById("loanAmount").value);
        const interestRate = Number.parseFloat(document.getElementById("interestRate").value) / 100;
        const loanTerm = Number.parseFloat(document.getElementById("loanTerm").value);
        const fixedPrincipal = document.getElementById('fixedPrincipal').checked;

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

        let allData = {
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

        additionalPayments.length && calcLoanData(allData, false, fixedPrincipal);
        calcLoanData(allData, true, fixedPrincipal);

        generateAdditionalInformation(allData);

        console.log(allData);

        // Render the per month table
        let tableHtml = allData.allPaymentsData.perMonth.reduce((tableHtml, rowData) => {
            return tableHtml += renderMonthTableRow(rowData);
        }, renderMonthTableStart({
            startMonth,
            loanAmount
        }));
        tableHtml += renderMonthTableEnd();
        tableDiv.innerHTML = tableHtml;

        // Charts
        drawLineChart(allData.lineChartData);
        drawPieChart(allData.pieChartData);

        allData = null;
    }

    element.addEventListener('click', () => calculate());
}
