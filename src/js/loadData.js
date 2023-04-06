export class loanData {
    constructor(startDate, loanAmount, interestRate, loanTerm, fixedPrincipal) {
        this._startDate = startDate;
        this._loanAmount = loanAmount;
        this._interestRate = interestRate;
        this._loanTerm = loanTerm;
        this._fixedPrincipal = fixedPrincipal;

        this._additionalPayments = [];
        this._interestRateChanges = [];
        this._noAddPaymentsData = [];
        this._allPaymentsData = [];
        this._lineChartData = [];
        this._pieChartData = [];

        this._allPaymentsInterest = 0;
        this._noAddPaymentsInterest = 0;

        this._lastPaymentDate = "";
        this._currentTotalPayment = 0;
    };

    get startDate() {
        return this._startDate;
    };

    set startDate(newStartDate) {
        this._startDate = newStartDate;
    };

    get loanAmount() {
        return this._loanAmount;
    };

    set loanAmount(newLoanAmount) {
        this._loanAmount = newLoanAmount;
    };

    get interestRate() {
        return this._interestRate;
    };

    set interestRate(newInterestRate) {
        this._interestRate = newInterestRate;
    };

    get loanTerm() {
        return this._loanTerm;
    };

    set loanTerm(newLoanTerm) {
        this._loanTerm = newLoanTerm;
    };

    get fixedPrincipal() {
        return this._fixedPrincipal;
    };

    set fixedPrincipal(newFixedPrincipal) {
        this._fixedPrincipal = newFixedPrincipal;
    };

    get additionalPayments() {
        return this._additionalPayments;
    };

    set additionalPayments(newPaymentsArray) {
        this._additionalPayments = newPaymentsArray;
    };

    get interestRateChanges() {
        return this._interestRateChanges;
    };

    set interestRateChanges(newInterestChangesArray) {
        this._interestRateChanges = newInterestChangesArray;
    };

    get noAddPaymentsData() {
        return this._noAddPaymentsData;
    };

    set noAddPaymentsData(newDataArray) {
        this._noAddPaymentsData = newDataArray;
    };

    addNoAdditionalPaymentData(newMonthlyDataObject) {
        this._noAddPaymentsData.push(newMonthlyDataObject);
    };

    get allPaymentsData() {
        return this._allPaymentsData;
    };

    set allPaymentsData(newDataArray) {
        this._allPaymentsData = newDataArray;
    };

    addAllPaymentsData(newMonthlyDataObject) {
        this._allPaymentsData.push(newMonthlyDataObject);
    };

    get lineChartData() {
        return this._lineChartData;
    };

    set lineChartData(newDataArray) {
        this._lineChartData = newDataArray;
    };

    addLineChartData(newMonthlyDataObject) {
        this._lineChartData.push(newMonthlyDataObject);
    };

    get pieChartData() {
        return this._pieChartData;
    };

    set pieChartData(newDataArray) {
        this._pieChartData = newDataArray;
    };

    addPieChartData(newMonthlyDataObject) {
        this._pieChartData.push(newMonthlyDataObject);
    };

    get allPaymentsInterest() {
        return this._allPaymentsInterest;
    };

    set allPaymentsInterest(newValue) {
        this._allPaymentsInterest = newValue;
    };

    get noAddPaymentsInterest() {
        return this._noAddPaymentsInterest;
    };

    set noAddPaymentsInterest(newValue) {
        this._noAddPaymentsInterest = newValue;
    };

    get lastPaymentDate() {
        return this._lastPaymentDate;
    };

    set lastPaymentDate(newValue) {
        this._lastPaymentDate = newValue;
    };

    get currentTotalPayment() {
        return this._currentTotalPayment;
    };

    set currentTotalPayment(newValue) {
        this._currentTotalPayment = newValue;
    };

    destroy() {
        this._startDate = null;
        delete this._startDate;

        this._loanAmount = null;
        delete this._loanAmount;

        this._interestRate = null;
        delete this._interestRate;

        this._loanTerm = null;
        delete this._loanTerm;

        this._fixedPrincipal = null;
        delete this._fixedPrincipal;

        this._additionalPayments = null;
        delete this._additionalPayments;

        this._interestRateChanges = null;
        delete this._interestRateChanges;

        this._noAddPaymentsData = null;
        delete this._noAddPaymentsData;

        this._allPaymentsData = null;
        delete this._allPaymentsData;

        this._lineChartData = null;
        delete this._lineChartData;

        this._pieChartData = null;
        delete this._pieChartData;

        this._allPaymentsInterest = null;
        delete this._allPaymentsInterest;

        this._noAddPaymentsInterest = null;
        delete this._noAddPaymentsInterest;

        this._lastPaymentDate = null;
        delete this._lastPaymentDate;

        this._currentTotalPayment = null;
        delete this._currentTotalPayment;
    }
}