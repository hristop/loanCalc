import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";
import { loanData } from "./loadData";

import moment from 'moment';

export function setUpCalc(element) {
    const calcLoanData = (loanData, includeAddPayments, isFixedPrincipal) => {
        let startMonth = moment(loanData.basicInfo.startDate, "DD/MM/YYYY");

        // Calculate the monthly interest rate
        const monthlyInterestRate = loanData.basicInfo.interestRate / 12;

        // This will hold the comulative interest for each month
        let totalMonthlyInterest = 0;

        // Initialize remaining principal to the loan amount
        let remainingPrincipal = loanData.basicInfo.loanAmount;

        // Fixed principal payment (varying monthly)
        let fixedPrincipalPayment = loanData.basicInfo.loanAmount / loanData.basicInfo.loanTerm;

        // Fixed monthly payment
        let variableMonthlyPayment =
            (loanData.basicInfo.loanAmount * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -loanData.basicInfo.loanTerm));

        for (let index = 1; index <= loanData.basicInfo.loanTerm; index++) {
            const currentMonth = startMonth.add(1, 'M');
            let bLastMonth = false;
            let newFixedPart = 0;
            let addMonthPayment = 0;
            let monthlyPrincipal = 0;
            let monthlyPayment = 0;

            // Gather additional payments info that will affect the monthly payment, principal and balance
            // If the monthly fixed part changed - reflect it for next months
            includeAddPayments && loanData.additionalPayments.forEach((payment) => {
                if (payment[0] === index) {
                    if(!isNaN(payment[1])) {
                        // the amount that was payed additionally
                        addMonthPayment += payment[1];
                    }

                    if (payment[2]) {
                        // new monthly payment or fixed principal
                        // if such arrangement was made with the loan provider
                        newFixedPart = payment[2];
                    }
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
            if (isFixedPrincipal) {
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
                isFixedPrincipal ?
                    fixedPrincipalPayment = newFixedPart :
                    variableMonthlyPayment = newFixedPart;
            }

            // Log payment details for this month
            if (includeAddPayments) {
                loanData.allPaymentsData.perMonth.push({
                    index,
                    currentMonth: currentMonth.format('DD/MM/YYYY'),
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
                    currentMonth: currentMonth.format('DD/MM/YYYY'),
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

            // If balance is zero or negative, break out of loop
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

    const generateAdditionalInformation = loanData => {
        const info = document.getElementById('info');
        const currentFinalPaymentDate = loanData.allPaymentsData.perMonth[loanData.allPaymentsData.perMonth.length - 1].currentMonth;
        loanData.allPaymentsData.currentTotalPayment = loanData.basicInfo.loanAmount + loanData.allPaymentsData.totalInterest;

        let infoHtml = `
            <div>
                <ui5-list separators="None">
                    <ui5-li additional-text="${(loanData.allPaymentsData.currentTotalPayment).toFixed(2)}" additional-text-state="Success">Total payment:</ui5-li>
                    <ui5-li additional-text="${(loanData.allPaymentsData.totalInterest).toFixed(2)}" additional-text-state="Error">Interest:</ui5-li>
                    <ui5-li additional-text="${currentFinalPaymentDate}">Final payment:</ui5-li>
                    <ui5-li additional-text="${loanData.allPaymentsData.perMonth.length}">Number of payments:</ui5-li>
                </ui5-list>
            </div>
        `;

        if (loanData.additionalPayments.length) {
            const paymentsSaved = loanData.noAddPaymentsData.perMonth.length - loanData.allPaymentsData.perMonth.length;
            const timeSaved = moment.duration(paymentsSaved, 'M');
            timeSaved.add(1, "d");
            infoHtml += `
                <div>
                    <ui5-list separators="None">
                        <ui5-li additional-text="${(loanData.basicInfo.loanAmount + loanData.noAddPaymentsData.totalInterest).toFixed(2)}" additional-text-state="Information">Initial total payment:</ui5-li>
                        <ui5-li additional-text="${(loanData.noAddPaymentsData.totalInterest - loanData.allPaymentsData.totalInterest).toFixed(2)}" additional-text-state="Success">Interest saved:</ui5-li>
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

        if (!validInput(loanAmount, interestRate, loanTerm) || !validateAdditionalPayments(loanTerm, additionalPayments)) {
            return;
        }

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
                startDate: startDate.format('DD/MM/YYYY'),
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

        const data = loanData();
        data.setBasicLoanInfo(allData.basicInfo);

        additionalPayments.length && calcLoanData(allData, false, fixedPrincipal);
        calcLoanData(allData, true, fixedPrincipal);

        generateAdditionalInformation(allData);

        console.log(allData);

        // Render the per month table
        let tableHtml = allData.allPaymentsData.perMonth.reduce((tableHtml, rowData) => {
            return tableHtml += renderMonthTableRow(rowData);
        }, renderMonthTableStart({
            startDate: startDate.format('DD/MM/YYYY'),
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
