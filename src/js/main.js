import '../css/style.css'
import { setUpCalc } from './calcLoan'
import { setUpExtraPayments } from './extraPayment';

import moment from 'moment';

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
import "@ui5/webcomponents/dist/Panel";
import "@ui5/webcomponents/dist/Title";
import "@ui5/webcomponents/dist/CheckBox";
import "@ui5/webcomponents/dist/MessageStrip";
import "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents/dist/List";
import "@ui5/webcomponents/dist/StandardListItem.js";
import "@ui5/webcomponents/dist/Slider";

import "@ui5/webcomponents-icons/dist/delete";

//import { setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";

//setLanguage("es");
setTheme("sap_horizon");

// Load Google Charts API
google.charts.load("current", { packages: ["corechart"] });
//google.charts.setOnLoadCallback(drawChart);

const startDate = document.getElementById("startDate");
startDate.setAttribute('value', moment().format('DD/MM/YYYY'));

setUpExtraPayments(document.getElementById('addExtraPayment'));
setUpCalc(document.getElementById('calcBtn'));

// window.onresize = doALoadOfStuff;

// function doALoadOfStuff() {
//     //do a load of stuff
// }
