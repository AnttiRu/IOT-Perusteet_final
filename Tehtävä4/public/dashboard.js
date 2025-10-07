// IoT Dashboard JavaScript
// Real-time data visualization and management

class IoTDashboard {
    constructor() {
        this.socket = io();
        this.temperatureChart = null;
        this.humidityChart = null;
        this.sensorData = [];
        this.alerts = [];
        this.initializeCharts();
        this.setupSocketListeners();
        this.loadInitialData();
    }

    // Initialize Chart.js charts
    initializeCharts() {
        const tempCtx = document.getElementById('temperatureChart').getContext('2d');
        const humidityCtx = document.getElementById('humidityChart').getContext('2d');

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        displayFormats: {
                            minute: 'HH:mm'
                        }
                    }
                },
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        };

        this.temperatureChart = new Chart(tempCtx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    }
                }
            }
        });

        this.humidityChart = new Chart(humidityCtx, {
            type: 'line',
            data: {
                datasets: []
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        }
                    }
                }
            }
        });
    }

    // Setup Socket.IO event listeners
    setupSocketListeners() {
        this.socket.on('connect', () => {
            this.updateConnectionStatus(true);
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus(false);
            console.log('Disconnected from server');
        });

        this.socket.on('newSensorData', (data) => {
            this.handleNewSensorData(data);
        });

        this.socket.on('sensorAlert', (alert) => {
            this.handleSensorAlert(alert);
        });
    }

    // Update connection status indicator
    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connection-status');
        statusElement.textContent = isConnected ? 'Online' : 'Offline';
        statusElement.className = `status ${isConnected ? 'online' : 'offline'}`;
    }

    // Load initial data from API
    async loadInitialData() {
        try {
            const response = await fetch('/api/sensors');
            const result = await response.json();
            
            if (result.success) {
                this.sensorData = result.data;
                this.updateDashboard();
                this.updateLastUpdate();
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    // Handle new sensor data from WebSocket
    handleNewSensorData(data) {
        this.sensorData.unshift(data);
        
        // Keep only last 100 readings for performance
        if (this.sensorData.length > 100) {
            this.sensorData = this.sensorData.slice(0, 100);
        }
        
        this.updateDashboard();
        this.updateLastUpdate();
    }

    // Handle sensor alerts
    handleSensorAlert(alert) {
        this.alerts.unshift(alert);
        
        // Keep only last 20 alerts
        if (this.alerts.length > 20) {
            this.alerts = this.alerts.slice(0, 20);
        }
        
        this.updateAlertsSection();
    }

    // Update all dashboard components
    updateDashboard() {
        this.updateSummaryCards();
        this.updateCharts();
        this.updateDataTable();
    }

    // Update summary cards
    updateSummaryCards() {
        const uniqueDevices = [...new Set(this.sensorData.map(d => d.device_id))];
        const totalReadings = this.sensorData.length;
        
        const avgTemp = this.sensorData.length > 0 ? 
            (this.sensorData.reduce((sum, d) => sum + d.temperature, 0) / this.sensorData.length).toFixed(1) : 
            '--';
            
        const avgHumidity = this.sensorData.length > 0 ? 
            (this.sensorData.reduce((sum, d) => sum + d.humidity, 0) / this.sensorData.length).toFixed(1) : 
            '--';

        document.getElementById('total-sensors').textContent = uniqueDevices.length;
        document.getElementById('total-readings').textContent = totalReadings;
        document.getElementById('avg-temperature').textContent = avgTemp !== '--' ? `${avgTemp}°C` : '--°C';
        document.getElementById('avg-humidity').textContent = avgHumidity !== '--' ? `${avgHumidity}%` : '--%';
    }

    // Update charts with latest data
    updateCharts() {
        const deviceData = this.groupDataByDevice();
        const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565', '#38b2ac'];
        
        // Update temperature chart
        this.temperatureChart.data.datasets = Object.keys(deviceData).map((deviceId, index) => ({
            label: deviceId,
            data: deviceData[deviceId].map(d => ({
                x: new Date(d.timestamp),
                y: d.temperature
            })),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            tension: 0.4
        }));
        
        // Update humidity chart
        this.humidityChart.data.datasets = Object.keys(deviceData).map((deviceId, index) => ({
            label: deviceId,
            data: deviceData[deviceId].map(d => ({
                x: new Date(d.timestamp),
                y: d.humidity
            })),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '20',
            tension: 0.4
        }));
        
        this.temperatureChart.update('none');
        this.humidityChart.update('none');
    }

    // Group sensor data by device ID
    groupDataByDevice() {
        const grouped = {};
        this.sensorData.forEach(data => {
            if (!grouped[data.device_id]) {
                grouped[data.device_id] = [];
            }
            grouped[data.device_id].push(data);
        });
        
        // Sort each device's data by timestamp
        Object.keys(grouped).forEach(deviceId => {
            grouped[deviceId].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
        
        return grouped;
    }

    // Update data table
    updateDataTable() {
        const tbody = document.getElementById('sensor-tbody');
        tbody.innerHTML = '';
        
        // Show latest 20 readings
        const recentData = this.sensorData.slice(0, 20);
        
        recentData.forEach(data => {
            const row = document.createElement('tr');
            const status = this.getSensorStatus(data.temperature, data.humidity);
            
            row.innerHTML = `
                <td>${data.device_id}</td>
                <td>${data.temperature.toFixed(1)}</td>
                <td>${data.humidity.toFixed(1)}</td>
                <td>${new Date(data.timestamp).toLocaleString()}</td>
                <td><span class="status-badge status-${status.type}">${status.text}</span></td>
            `;
            
            tbody.appendChild(row);
        });
    }

    // Get sensor status based on values
    getSensorStatus(temperature, humidity) {
        const tempConfig = { min: 15, max: 30 };
        const humidityConfig = { min: 30, max: 70 };
        
        const tempCritical = temperature < (tempConfig.min - 5) || temperature > (tempConfig.max + 5);
        const humidityCritical = humidity < (humidityConfig.min - 10) || humidity > (humidityConfig.max + 10);
        
        if (tempCritical || humidityCritical) {
            return { type: 'critical', text: 'Critical' };
        }
        
        const tempWarning = temperature < tempConfig.min || temperature > tempConfig.max;
        const humidityWarning = humidity < humidityConfig.min || humidity > humidityConfig.max;
        
        if (tempWarning || humidityWarning) {
            return { type: 'warning', text: 'Warning' };
        }
        
        return { type: 'normal', text: 'Normal' };
    }

    // Update alerts section
    updateAlertsSection() {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';
        
        if (this.alerts.length === 0) {
            container.innerHTML = '<p style="color: #718096; text-align: center; padding: 20px;">No recent alerts</p>';
            return;
        }
        
        this.alerts.forEach(alert => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert-item alert-${alert.type}`;
            alertDiv.innerHTML = `
                <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
                <div class="alert-message">${alert.message}</div>
            `;
            container.appendChild(alertDiv);
        });
    }

    // Update last update timestamp
    updateLastUpdate() {
        const lastUpdateElement = document.getElementById('last-update');
        lastUpdateElement.textContent = `Last update: ${new Date().toLocaleTimeString()}`;
    }
}

// Refresh data function
async function refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    const originalText = refreshBtn.textContent;
    
    refreshBtn.innerHTML = '<span class="loading"></span> Refreshing...';
    refreshBtn.disabled = true;
    
    try {
        await dashboard.loadInitialData();
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
    
    setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.disabled = false;
    }, 1000);
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new IoTDashboard();
});