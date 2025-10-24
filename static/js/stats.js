document.addEventListener('DOMContentLoaded', () => {
    // Usar fetch para obtener los datos de la API del servidor 
    fetch('/api/stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar las estadísticas');
            }
            return response.json();
        })
        .then(data => {
            // Renderizar los 3 graficos [cite: 8]
            renderGraficoLinea(data.linea);
            renderGraficoTorta(data.torta);
            renderGraficoBarras(data.barras);
        })
        .catch(error => {
            console.error('Error en fetch:', error);
            document.getElementById('chart-container-linea').innerText = 'No se pudieron cargar los datos del gráfico.';
            document.getElementById('chart-container-torta').innerText = 'No se pudieron cargar los datos del gráfico.';
            document.getElementById('chart-container-barras').innerText = 'No se pudieron cargar los datos del gráfico.';
        });
});

/**
 * Grafico 1: Lineas (Avisos por dia) [cite: 9]
 */
function renderGraficoLinea(data) {
    Highcharts.chart('chart-container-linea', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Avisos de adopción por día'
        },
        xAxis: {
            categories: data.map(d => d.fecha), // Eje X: Dias [cite: 10]
            title: {
                text: 'Fecha'
            }
        },
        yAxis: {
            title: {
                text: 'Cantidad de Avisos' // Eje Y: Cantidad [cite: 10]
            }
        },
        series: [{
            name: 'Avisos',
            data: data.map(d => d.cantidad)
        }],
        credits: { enabled: false }
    });
}

/**
 * Grafico 2: Torta (Avisos por tipo) [cite: 11]
 */
function renderGraficoTorta(data) {
    // Formatear datos para Highcharts (ej: { name: 'Perro', y: 5 })
    const formattedData = data.map(d => ({
        name: d.tipo.charAt(0).toUpperCase() + d.tipo.slice(1), // Capitalizar (Perro/Gato)
        y: d.total
    }));

    Highcharts.chart('chart-container-torta', {
        chart: {
            type: 'pie'
        },
        title: {
            text: 'Total de avisos por tipo de mascota'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} avisos)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                }
            }
        },
        series: [{
            name: 'Avisos',
            colorByPoint: true,
            data: formattedData
        }],
        credits: { enabled: false }
    });
}

/**
 * Grafico 3: Barras (Avisos por mes, Perro vs Gato) [cite: 12]
 */
function renderGraficoBarras(data) {
    Highcharts.chart('chart-container-barras', {
        chart: {
            type: 'column' // 'column' es barra vertical
        },
        title: {
            text: 'Avisos de Gatos vs. Perros por Mes'
        },
        xAxis: {
            categories: data.map(d => d.mes), // Eje X: Meses [cite: 12]
            title: {
                text: 'Mes'
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Cantidad de Avisos' // Eje Y: Cantidad [cite: 13]
            }
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            column: {
                grouping: true,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Gatos', // Barra para Gatos [cite: 12]
            data: data.map(d => d.gatos),
            color: '#FFA500' // Naranja
        }, {
            name: 'Perros', // Barra para Perros [cite: 12]
            data: data.map(d => d.perros),
            color: '#4682B4' // Azul
        }],
        credits: { enabled: false }
    });
}