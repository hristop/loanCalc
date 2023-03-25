import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";

import moment from 'moment';

export function setUpCalc(element) {
    const calcLoanData = (loanData, includeAddPayments, isFixedPrincipal) => {
        // Calculate monthly payment
        let startMonth = moment(loanData.basicInfo.startDate, "DD/MM/YYYY");
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

                // loanData.allPaymentsData.perMonth.push({
                //     index,
                //     currentMonth: currentMonth.format('DD/MM/YYYY'),
                //     monthlyPayment,
                //     addMonthPayment,
                //     monthlyPrincipal,
                //     monthlyInterest,
                //     totalMonthlyInterest,
                //     remainingPrincipal
                // });

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
