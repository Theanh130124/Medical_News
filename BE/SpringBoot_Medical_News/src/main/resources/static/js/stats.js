document.addEventListener("DOMContentLoaded", function () {
    if (typeof statsData !== "undefined" && statsData.length > 0) {
        const labels = [];
        const values = [];

        statsData.forEach(item => {
            // Giả sử stats trả về [label, count]
            labels.push(item[0]);
            values.push(item[1]);
        });

        const ctx = document.getElementById("statsChart").getContext("2d");
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Số lượng người dùng",
                    data: values,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
});
