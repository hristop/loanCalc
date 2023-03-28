const loanData = () => {
    let basicLoanInfo = {};
    const additionalPayments = [];
    const noAddPaymentsData = [];
    const allPaymentsData = [];
    const lineChartData = [];
    const pieChartData = [];
    const additionalLoanInfo = {}

    const setBasicLoanInfo = basicLoanInfoMap => {
        basicLoanInfo.startDate = basicLoanInfoMap.startDate;
        basicLoanInfo.loanAmount = basicLoanInfoMap.loanAmount;
        basicLoanInfo.interestRate = basicLoanInfoMap.interestRate;
        basicLoanInfo.loanTerm = basicLoanInfoMap.loanTerm;
        basicLoanInfo.fixedPrincipal = basicLoanInfoMap.fixedPrincipal;
    }

    const getBasicLoanInfo = () => basicLoanInfo;

    return {
        setBasicLoanInfo,
        getBasicLoanInfo
    }
}

export {
    loanData
}