import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";
import { loanData } from "./loadData";
import { gatherInterestChanges } from "./interestChanges";

import moment from 'moment';

export function setUpCalc(element) {
    const calcVariableMonthlyPayment = (loanAmount, monthlyInterest, loanTerm) => {
        return (loanAmount * monthlyInterest) / (1 - Math.pow(1 + monthlyInterest, -loanTerm));
    };

    const calcLoanData = (loanData, includeAddPayments) => {
        const startMonth = moment(loanData.startDate, 'DD/MM/YYYY');

        // Calculate the monthly interest rate
        let monthlyInterestRate = loanData.interestRate / 12;

        // This will hold the comulative interest for each month
        let totalMonthlyInterest = 0;

        // Initialize remaining principal to the loan amount
        let remainingPrincipal = loanData.loanAmount;

        // Fixed principal payment (varying monthly)
        let fixedPrincipalPayment = loanData.loanAmount / loanData.loanTerm;

        // Fixed monthly payment
        let variableMonthlyPayment = calcVariableMonthlyPayment(loanData.loanAmount, monthlyInterestRate, loanData.loanTerm);
            // (loanData.loanAmount * monthlyInterestRate) /
            // (1 - Math.pow(1 + monthlyInterestRate, -loanData.loanTerm));

        //for (let index = 1; index <= loanData.loanTerm; index++) {
        let index = 0;
        while (remainingPrincipal > 0) {
            const currentMonth = startMonth.add(1, 'M').format("DD/MM/YYYY");
            let bLastMonth = false;
            let newFixedPart = 0;
            let addMonthPayment = 0;
            let monthlyPrincipal = 0;
            let monthlyPayment = 0;
            index ++;

            loanData.interestRateChanges.forEach(interestRateChange => {
                if (interestRateChange[0] !== index) {
                    return;
                }

                if(!isNaN(interestRateChange[1])) {
                    // the new interest rate should take effect (converted from %)
                    monthlyInterestRate = interestRateChange[1] / 12 / 100;
                    // Calculate the new variable monthly payment based on
                    // - the remaining loan principal
                    // - the new interest rate
                    // - the remaining time
                    // variableMonthlyPayment = calcVariableMonthlyPayment(remainingPrincipal, monthlyInterestRate, Math.abs(loanData.loanTerm - index));
                }
            })

            // Gather additional payments info that will affect the monthly payment, principal and balance
            // If the monthly fixed part changed - reflect it for next months
            includeAddPayments && loanData.additionalPayments.forEach((payment) => {
                if (payment[0] !== index) {
                    return;
                }

                if(!isNaN(payment[1])) {
                    // the amount that was payed additionally
                    addMonthPayment += payment[1];
                }

                if (payment[2]) {
                    // new monthly payment or fixed principal
                    // if such arrangement was made with the loan provider
                    newFixedPart = payment[2];
                }
            });

            // Calculate interest for this month
            const monthlyInterest = remainingPrincipal * monthlyInterestRate;

            // Calculate monthly payment based on the type of principal and payment:
            // * Fixed principal payment
            //   Monthly payment varies and consists of fixed principal payment and interest
            // * Variable monthly payment
            //   Monthly payment is fixed and consists of principal and interest
            // To both types the additional monthly payment is applied only on the interest
            // which means that the loan time will be shortened and the monthly payment will
            // not be affected by the calculation
            // The new
            if (loanData.fixedPrincipal) {
                // Calculate principal for this month
                monthlyPrincipal = fixedPrincipalPayment;

                // Calculate monthly payment
                monthlyPrincipal += addMonthPayment;
                monthlyPayment = monthlyInterest + monthlyPrincipal;
            } else {
                // Payment for each month may vary if there is additional payment made
                // or the remaining principal is less than the payment itself
                monthlyPayment = variableMonthlyPayment

                // Calculate monthly payment
                monthlyPayment += addMonthPayment
                monthlyPrincipal = monthlyPayment - monthlyInterest;
            }

            // Update balance for next month
            if (monthlyPrincipal >= remainingPrincipal || Math.abs(remainingPrincipal - monthlyPrincipal) <= 1) {
                // the monthly payment is more than the actual amount of loan left
                bLastMonth = true;
                monthlyPrincipal = remainingPrincipal;
                monthlyPayment = monthlyPrincipal + monthlyInterest;
                remainingPrincipal = 0;
            } else {
                remainingPrincipal -= monthlyPrincipal;
            }

            totalMonthlyInterest += monthlyInterest;

            // Change fixed part for the next monthly calculations
            if (newFixedPart) {
                loanData.fixedPrincipal ?
                    fixedPrincipalPayment = newFixedPart :
                    variableMonthlyPayment = newFixedPart;
            }

            // Log payment details for this month
            if (includeAddPayments) {
                loanData.addAllPaymentsData({
                    index,
                    month: currentMonth,
                    monthlyPayment,
                    addMonthPayment,
                    monthlyPrincipal,
                    monthlyInterest,
                    totalMonthlyInterest,
                    remainingPrincipal
                });
            } else {
                loanData.addNoAdditionalPaymentData({
                    index,
                    month: currentMonth,
                    monthlyPayment,
                    addMonthPayment,
                    monthlyPrincipal,
                    monthlyInterest,
                    totalMonthlyInterest,
                    remainingPrincipal
                });
            }

            // Line chart data
            // Google chards data
            includeAddPayments && loanData.addLineChartData([
                index,
                remainingPrincipal,
                totalMonthlyInterest
            ]);

            // If balance is zero or negative, break out of loop
            if (bLastMonth) {
                // Extract total interest
                includeAddPayments ?
                    loanData.allPaymentsInterest = totalMonthlyInterest :
                    loanData.noAddPaymentsInterest = totalMonthlyInterest;

                // Pie chart data
                includeAddPayments && loanData.addPieChartData(["Principal", loanData.loanAmount]);
                includeAddPayments && loanData.addPieChartData(["Interest", loanData.allPaymentsInterest]);

                loanData.lastPaymentDate = currentMonth;
                break;
            }
        }
    }

    const generateAdditionalInformation = loanData => {
        const info = document.getElementById('info');
        loanData.currentTotalPayment = loanData.loanAmount + loanData.allPaymentsInterest;

        let infoHtml = `
            <div>
                <ui5-list separators="None">
                    <ui5-li additional-text="${(loanData.currentTotalPayment).toFixed(2)}" additional-text-state="Information">Total payment:</ui5-li>
                    <ui5-li additional-text="${(loanData.allPaymentsInterest).toFixed(2)}" additional-text-state="Error">Interest:</ui5-li>
                    <ui5-li additional-text="${loanData.lastPaymentDate}">Final payment:</ui5-li>
                    <ui5-li additional-text="${loanData.allPaymentsData.length}">Number of payments:</ui5-li>
                </ui5-list>
            </div>
        `;

        if (loanData.additionalPayments.length) {
            const paymentsSaved = loanData.noAddPaymentsData.length - loanData.allPaymentsData.length;
            const timeSaved = moment.duration(paymentsSaved, 'M');
            timeSaved.add(1, "d");
            infoHtml += `
                <div>
                    <ui5-list separators="None">
                        <ui5-li additional-text="${(loanData.loanAmount + loanData.noAddPaymentsInterest).toFixed(2)}" additional-text-state="Information">Initial total payment:</ui5-li>
                        <ui5-li additional-text="${(loanData.noAddPaymentsInterest - loanData.allPaymentsInterest).toFixed(2)}" additional-text-state="Success">Interest saved:</ui5-li>
                        <ui5-li additional-text="${paymentsSaved}" additional-text-state="Success">Number of payments saved:</ui5-li>
                        <ui5-li ${Math.abs(timeSaved.asMonths()) > 1 ? '' : 'class="hidden"'} additional-text="${timeSaved.years() !== 0 ? Math.abs(timeSaved.years()) + ' years' : ""} ${timeSaved.months() !== 0 ? Math.abs(timeSaved.months()) + ' months' : ""}" additional-text-state="Success">Time saved:</ui5-li>
                    </ui5-list>
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
        const interestChanges = gatherInterestChanges();
        console.log(interestChanges);

        if (!validInput(loanAmount, interestRate, loanTerm) || !validateAdditionalPayments(loanTerm, additionalPayments)) {
            return;
        }

        // Show all sections
        document.querySelectorAll('ui5-panel.hidden').forEach(panel => panel.classList.remove('hidden'));


        const data = new loanData(startDate.format("DD/MM/YYYY"), loanAmount, interestRate, loanTerm, fixedPrincipal);
        data.additionalPayments = additionalPayments;
        data.interestRateChanges = interestChanges;
        data.lineChartData = [
            //["Month", "Principal", "Interest"],
            [0, loanAmount, 0],
        ];
        data.pieChartData = [
            //["Principal", "Interest"]
        ];

        additionalPayments.length && calcLoanData(data, false);
        calcLoanData(data, true);

        generateAdditionalInformation(data);

        // Render the per month table
        let tableHtml = data.allPaymentsData.reduce((tableHtml, rowData) => {
            return tableHtml += renderMonthTableRow(rowData);
        }, renderMonthTableStart(data));
        tableHtml += renderMonthTableEnd();
        tableDiv.innerHTML = tableHtml;

        // Charts
        drawLineChart(data.lineChartData);
        drawPieChart(data.pieChartData);

        data.destroy();
    }

    element.addEventListener('click', () => calculate());
}
