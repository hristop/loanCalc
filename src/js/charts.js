import HighCharts from 'highcharts';

const extractToLineChartSeries = (data, seriesName, index) => {
    const seriesData = data.map(dataPoint => ({
        x: dataPoint[0],
        y: dataPoint[index]
    }));
    return {
        name: seriesName,
        data: seriesData
    }
};

const drawLineChart = lineChartData => {
    const remainingPrincipal = extractToLineChartSeries(lineChartData, "Principal", 1);
    const totalInterest = extractToLineChartSeries(lineChartData, "Interest", 2);

    remainingPrincipal.color = '#0070f2';
    totalInterest.color = '#aa0808';

    const options = {
        title: {
            text: 'Loan Payment Schedule'
        },
        xAxis: {
            title: {
                text: 'Month'
            }
        },
        yAxis: {
            title: {
                text: 'Amount'
            }
        },
        series: [
            remainingPrincipal,
            totalInterest
        ],
        legend: {
            align: 'center',
            verticalAlign: 'bottom'
        },
        tooltip: {
            shared: true,
            useHTML: true,
            headerFormat: '<table><tr><th colspan="2">{point.key}</th></tr>',
            pointFormat:
                '<tr><td style="color: {series.color}">{series.name} </td>' +
                '<td style="text-align: right"><b>{point.y}</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2
        }
    };

    HighCharts.chart('lineChart', options);
};

const drawPieChart = pieChartData => {
    const options = {
        title: {
            text: 'Loan Payment'
        },
        colors: [
            '#ff0000',
            '#0d233a'
        ],
        series: [{
            type: 'pie',
            data: [
                {
                    name: pieChartData[0][0],
                    color: '#0070f2',
                    y: pieChartData[0][1]
                },
                {
                    name: pieChartData[1][0],
                    color: '#aa0808',
                    y: pieChartData[1][1]
                }
            ]
        }],
        legend: {
            align: 'right',
            verticalAlign: 'middle'
        },
        tooltip: {
            useHTML: true,
            headerFormat: '<table><tr><th colspan="2">{point.key}</th></tr>',
            pointFormat:
                '<tr><td> {point.y} </td></tr>' +
                '<tr><td style="text-align: right"><b>{point.percentage:.2f} %</b></td></tr>',
            footerFormat: '</table>',
            valueDecimals: 2
            //pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        }
    };

    HighCharts.chart('pieChart', options);
};

export {
    drawLineChart,
    drawPieChart
};
