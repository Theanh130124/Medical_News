document.addEventListener("DOMContentLoaded", function () {
    function renderChart(canvasId, data, label) {
        if (data && data.length > 0) {
            const labels = [];
            const values = [];
            data.forEach(item => {
                labels.push(item[0] + "-" + item[2] + " (Q" + item[1] + ")");
                values.push(item[3]);
            });
            const ctx = document.getElementById(canvasId).getContext("2d");
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: values,
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            });
        }
    }

    if (document.getElementById("statsChartUser")) {
        renderChart("statsChartUser", statsUserData, "Số lượng người dùng");
    }
    if (document.getElementById("statsChartPost")) {
        renderChart("statsChartPost", statsPostData, "Số lượng bài viết");
    }
});
