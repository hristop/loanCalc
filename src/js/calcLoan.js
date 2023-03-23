import { validInput, validateAdditionalPayments } from "./validateInput";
import { renderMonthTableStart, renderMonthTableRow, renderMonthTableEnd } from "./monthTable";
import { gatherAdditionalPayments } from "./extraPayment";
import { drawLineChart, drawPieChart } from "./charts";

import moment from 'moment';

export function setUpCalc(element) {
    const calcLoanData = (loanData, includeAddPayments) => {
        // Calculate monthly payment
        const monthlyInterestRate = loanData.basicInfo.interestRate / 12;
        let monthlyPayment =
            (loanData.basicInfo.loanAmount * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -loanData.basicInfo.loanTerm));

        let remainingPrincipal = loanData.basicInfo.loanAmount;
        let totalInterestPaid = 0;

        for (let index = 1; index <= loanData.basicInfo.loanTerm; index++) {
            let bLastMonth = false;
            let addMonthPayment = 0; // Used for the month with additional payment
            const currentMonth = loanData.basicInfo.startDate.add(1, 'M');

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
                loanData.withAddPaymentsData.perMonth.push({
                    index,
                    currentMonth,
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
                    currentMonth,
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
                    loanData.withAddPaymentsData.totalInterestPaid = totalInterestPaid :
                    loanData.noAddPaymentsData.totalInterestPaid = totalInterestPaid;

                // Pie chart data
                includeAddPayments && loanData.pieChartData.push(["Principal", loanData.basicInfo.loanAmount]);
                includeAddPayments && loanData.pieChartData.push(["Interest", totalInterestPaid]);
                break;
            }
        }
    }

    const calculate = () => {
        // Get input values
        const startDate = moment(document.getElementById("startDate").value, "DD/MM/YYYY");
        const loanAmount = Number.parseFloat(document.getElementById("loanAmount").value);
        const interestRate = Number.parseFloat(document.getElementById("interestRate").value) / 100;
        const loanTerm = Number.parseFloat(document.getElementById("loanTerm").value);

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
        document.querySelectorAll('section.hidden').forEach(section => section.classList.remove('hidden'));

        const allPaymentsData = {
            basicInfo: {
                startDate,
                loanAmount,
                interestRate,
                loanTerm
            },
            additionalPayments,
            noAddPaymentsData: {
                perMonth: []
            },
            withAddPaymentsData: {
                perMonth: []
            },
            lineChartData,
            pieChartData
        }

        calcLoanData(allPaymentsData, false);
        calcLoanData(allPaymentsData, true);

        // Render the per month table
        let tableHtml = allPaymentsData.withAddPaymentsData.perMonth.reduce((tableHtml, rowData) => {
            return tableHtml += renderMonthTableRow(rowData);
        }, renderMonthTableStart({
            startDate,
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
