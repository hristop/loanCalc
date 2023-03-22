import '../css/style.css'
import { setUpCalc } from './calcLoan'
import { setUpExtraPayments } from './addExtraPayment';

import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/DatePicker";
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableRow";
import "@ui5/webcomponents/dist/TableColumn";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/MessageStrip";
import "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents-icons/dist/delete";

//import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

//setLanguage("es");
setTheme("sap_horizon");

// Load Google Charts API
google.charts.load("current", { packages: ["corechart"] });
//google.charts.setOnLoadCallback(drawChart);

let today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();

today = dd + '/' + mm + '/' + yyyy;

const startDate = document.getElementById("startDate");
startDate.setAttribute('value', today);
// startDate.setAttribute('max-date', today);

setUpExtraPayments({
  extraPaymentsAddButton: document.querySelector('#addExtraPayment')
});
setUpCalc(document.querySelector('#calcBtn'));

