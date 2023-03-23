# loanCalc
Loan Calculator

## Start the calculator
Install the packages
```
npm install
```

Run Vite dev server
```
npm run dev
```

or preview
```
npm run preview
```
Follow the link provided in the console.

## How to use

The calculator takes few basic parameters which are:
* `Starting date`: date, which will be considered as start of calculations and will be used to show when the loan will be completely payed off.
* `Loan Amount`: the amount of money which will be withdrawn (the principal)
* `Interest rate`: the interest rate
* `Loan term`: Initial term in which the loan should be returned

It is possible to include extra payments that happend during the period of the loan. The calculations will assume that the payments are only covering the **principal** and not the **interest**

Adding an extra payment will require 2 things and can include a third optional:
* `Payment month number`: the nuymber of the month since the beginning in which the payment is made. *E.g. if you make an extra payment around the end of the first year, this means that the payment is made around the 12th month.*
* `Payment ammount`: the amount of **principal** covered
* `New monthly payment`: in some cases, it is possible to change the montly payment after the extra payment, depending on the bank / other arrangements. The monthly payment amount can be adjusted from that field.

After providing all the information that is required / optional, press the "Calculate" button.