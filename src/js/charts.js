const drawLineChart = lineChartData => {
    var data = google.visualization.arrayToDataTable(lineChartData);

    var options = {
        title: "Loan Payment Schedule",
        curveType: "function",
        legend: {
            position: "right",
            alignment: "center"
        },
        hAxis: { title: "Month" },
        vAxis: { title: "Amount" },
        width: 600
    };

    var chart = new google.visualization.LineChart(
        document.getElementById("lineChart")
    );
    chart.draw(data, options);
}

const drawPieChart = pieChartData => {
    var data = google.visualization.arrayToDataTable(pieChartData);

    var options = {
        title: "Loan Payment",
        legend: {
            position: "right",
            alignment: "center"
        },
        width: 500,
        pieSliceText: 'value'
    };

    var chart = new google.visualization.PieChart(
        document.getElementById("pieChart")
    );
    chart.draw(data, options);
}

export {
    drawLineChart,
    drawPieChart
}