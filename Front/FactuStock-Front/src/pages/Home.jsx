import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import authService from "../services/authService";
import Sidebar from "../components/Sidebar";
import axios from 'axios';
import Swal from "sweetalert2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

axios.defaults.baseURL = 'http://localhost:8080';

const Home = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [expandedChart, setExpandedChart] = useState(null);
    const [balanceData, setBalanceData] = useState({
        balance: null,
        facturasNoCompletadas: null,
        cajaAbierta: {
            nombre: "",
            totalIngresado: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const currentYear = new Date().getFullYear();
    const [top5Productos, setTop5Productos] = useState([]);
    const [ventasPorMes, setVentasPorMes] = useState([]);
    const [ingresosMensuales, setIngresosMensuales] = useState([]);
    const [gastosMensuales, setGastosMensuales] = useState([]);
    const [empresasFacturas, setEmpresasFacturas] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        if (!authService.isAuthenticated()) {
            navigate("/login");
        } else {
            const fetchUserData = async () => {
                try {
                    const decodedToken = JSON.parse(atob(token.split(".")[1]));
                    const userId = decodedToken?.idUsuario;

                    if (!userId) {
                        setError("ID de usuario no encontrado en el token.");
                        return;
                    }

                    const userResponse = await axios.get(`/usuarios/${userId}`);
                    setUsername(userResponse.data.username || "Invitado");

                    await fetchBalanceData(currentYear, userResponse.data.organizacion.id);
                    await fetchTop5Productos(userResponse.data.organizacion.id);
                    await fetchVentasPorMes(userResponse.data.organizacion.id);
                    await fetchIngresosMensuales(userResponse.data.organizacion.id, currentYear);
                    await fetchGastosMensuales(userResponse.data.organizacion.id, currentYear);
                    await fetchEmpresasFacturas(userResponse.data.organizacion.id);
                } catch (err) {
                    console.error("Error completo:", err);
                    setError(`Error al obtener los datos del usuario: ${err.message}`);
                    Swal.fire('Error', 'No se pudieron cargar los datos del usuario', 'error');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserData();
        }
    }, [navigate]);

    const fetchBalanceData = async (year, organizacionId) => {
        try {
            const [ingresosResponse, gastosResponse, facturasNoCompletadasResponse, cajaAbiertaResponse] = await Promise.all([
                axios.get(`/ingresos/total/${organizacionId}/${year}`),
                axios.get(`/gastos/total/${organizacionId}/${year}`),
                axios.get(`/facturas/no-completadas/${organizacionId}`),
                axios.get(`/cajas/abierta/organizacion/${organizacionId}`)
            ]);

            const totalIngresos = ingresosResponse.data;
            const totalGastos = gastosResponse.data;
            const balance = totalIngresos - totalGastos;
            const facturasNoCompletadas = facturasNoCompletadasResponse.data;
            const cajaAbierta = cajaAbiertaResponse.data;

            setBalanceData({
                balance,
                facturasNoCompletadas,
                cajaAbierta: {
                    nombre: cajaAbierta.nombre,
                    totalIngresado: cajaAbierta.totalIngresado
                }
            });
        } catch (error) {
            console.error("Error completo al obtener datos del balance:", error);
            setError(`Error al obtener datos del balance: ${error.message}`);
            Swal.fire('Error', 'No se pudieron cargar los datos del balance', 'error');
        }
    };

    const fetchTop5Productos = async (organizacionId) => {
        try {
            const response = await axios.get(`/detalles/top5-productos-vendidos/${organizacionId}`);
            const sortedProducts = Object.entries(response.data)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            setTop5Productos(sortedProducts);
        } catch (error) {
            console.error('Error al obtener los 5 productos más vendidos:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de los productos más vendidos', 'error');
        }
    };

    const fetchVentasPorMes = async (organizacionId) => {
        try {
            const response = await axios.get(`/ventas/por-mes/${organizacionId}/${currentYear}`);
            setVentasPorMes(response.data);
        } catch (error) {
            console.error('Error al obtener las ventas por mes:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de ventas por mes', 'error');
        }
    };

    const fetchIngresosMensuales = async (organizacionId, year) => {
        try {
            const response = await axios.get(`/ingresos/mensuales/${organizacionId}/${year}`);
            setIngresosMensuales(response.data);
        } catch (error) {
            console.error('Error al obtener los ingresos mensuales:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de ingresos mensuales', 'error');
        }
    };

    const fetchGastosMensuales = async (organizacionId, year) => {
        try {
            const response = await axios.get(`/gastos/mensuales/${organizacionId}/${year}`);
            setGastosMensuales(response.data);
        } catch (error) {
            console.error('Error al obtener los gastos mensuales:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de gastos mensuales', 'error');
        }
    };

    const fetchEmpresasFacturas = async (organizacionId) => {
        try {
            const response = await axios.get(`/EmpresaPersonaFisica/top6-facturas/${organizacionId}`);
            setEmpresasFacturas(response.data);
        } catch (error) {
            console.error('Error al obtener las empresas por facturas:', error);
            Swal.fire('Error', 'No se pudieron cargar los datos de las empresas por facturas', 'error');
        }
    };

    const getBalanceColor = (balance) => {
        if (balance > 0) return 'linear-gradient(45deg, #4CAF50, #45a049)';
        if (balance < 0) return 'linear-gradient(45deg, #f44336, #d32f2f)';
        return 'linear-gradient(45deg, #FFA500, #FF8C00)';
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 10,
                    font: { size: 10 }
                }
            },
            title: {
                display: true,
                font: { size: 14, weight: 'bold' }
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 8 } }
            },
            y: {
                grid: { borderDash: [2], color: 'rgba(0, 0, 0, 0.1)' },
                ticks: { font: { size: 8 } }
            }
        }
    };

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const ventasPorMesData = {
        labels: months,
        datasets: [{
            label: 'Ventas',
            data: months.map((_, index) => {
                const venta = ventasPorMes.find(v => v.mes === index + 1);
                return venta ? venta.cantidad_ventas : 0;
            }),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.3
        }]
    };

    const ingresosVsGastosData = {
        labels: months,
        datasets: [
            {
                label: 'Ingresos',
                data: months.map((_, index) => {
                    const ingreso = ingresosMensuales.find(i => i.mes === index + 1);
                    return ingreso ? ingreso.ingresos : 0;
                }),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Gastos',
                data: months.map((_, index) => {
                    const gasto = gastosMensuales.find(g => g.mes === index + 1);
                    return gasto ? gasto.gastos : 0;
                }),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    const empresasFacturasData = {
        labels: empresasFacturas.map(e => e.nombre),
        datasets: [
            {
                label: 'Facturas',
                data: empresasFacturas.map(e => e.facturas_count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    const top5ProductosData = {
        labels: top5Productos.map(product => product[0]),
        datasets: [{
            data: top5Productos.map(product => product[1]),
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1
        }]
    };

    const top5ProductosOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 15,
                    font: { size: 10 },
                    generateLabels: function (chart) {
                        const data = chart.data;
                        return data.labels.map((label, index) => {
                            const value = data.datasets[0].data[index];
                            return {
                                text: `${label}: ${value} `,
                                fillStyle: data.datasets[0].backgroundColor[index],
                                strokeStyle: data.datasets[0].borderColor[index],
                                lineWidth: data.datasets[0].borderWidth,
                                hidden: false,
                                index: index
                            };
                        });
                    }
                }
            },
            title: {
                display: true,
                text: 'Top 5 Productos Más Vendidos',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed + ' unidades';
                        }
                        return label;
                    }
                }
            }
        }
    };

    const charts = [
        { id: 'ventasPorMes', title: 'Ventas por Mes', chart: <Line data={ventasPorMesData} options={chartOptions} /> },
        { id: 'ingresosVsGastos', title: 'Ingresos vs Gastos', chart: <Bar data={ingresosVsGastosData} options={chartOptions} /> },
        { id: 'empresasFacturas', title: 'Empresas por Facturas', chart: <Bar data={empresasFacturasData} options={chartOptions} /> },
        { id: 'top5Productos', title: 'Top 5 Productos Más Vendidos', chart: <Pie data={top5ProductosData} options={top5ProductosOptions} /> }
    ];

    const getFacturasNoCompletadasStyle = (value) => {
        if (value > 0) {
            return {
                animation: 'blink 1s linear infinite',
                background: 'linear-gradient(45deg, #ff0000, #ff6666)',
                cursor: 'pointer'
            };
        }
        return {
            background: 'linear-gradient(45deg, #FFA500, #FF8C00)'
        };
    };

    const getCajaAbiertaStyle = (nombre) => {
        if (nombre === "No hay caja abierta") {
            return {
                background: 'linear-gradient(45deg, #808080, #A9A9A9)',
                cursor: 'pointer'
            };
        }
        return {
            background: 'linear-gradient(45deg, #3498db, #2980b9)',
            cursor: 'pointer'
        };
    };

    if (error) {
        return (
            <div className="wrapper">
                <Sidebar />
                <div className="main d-flex flex-column justify-content-center align-items-center">
                    <div>Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="wrapper" style={{ minHeight: '100vh' }}>
            <Sidebar />
            <div className="main d-flex flex-column" style={{ padding: '10px', backgroundColor: '#f0f2f5' }}>
                <h1 className="text-center mb-2" style={{ fontSize: '1.5rem', color: '#333' }}>Bienvenido a FactuStock</h1>
                <p className="text-center mb-3" style={{ fontSize: '1rem', color: '#666' }}>¡Hola, <strong>{username}</strong>!</p>
                <div className="d-flex justify-content-between mb-3">
                    {[
                        {
                            title: 'Balance',
                            value: balanceData.balance !== null ? `${balanceData.balance.toFixed(2)} €` : 'N/A',
                            color: getBalanceColor(balanceData.balance)
                        },
                        {
                            title: 'Facturas No Completadas',
                            value: balanceData.facturasNoCompletadas !== null ? balanceData.facturasNoCompletadas : 'N/A',
                            style: getFacturasNoCompletadasStyle(balanceData.facturasNoCompletadas),
                            onClick: () => navigate('/facturas')
                        },
                        {
                            title: 'Caja Abierta',
                            value: (
                                <div>
                                    <div>{balanceData.cajaAbierta.nombre}</div>
                                    <div>Total: {balanceData.cajaAbierta.totalIngresado.toFixed(2)} €</div>
                                </div>
                            ),
                            style: getCajaAbiertaStyle(balanceData.cajaAbierta.nombre),
                            onClick: () => navigate('/caja')
                        }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="card text-white"
                            style={{
                                flex: 1,
                                margin: '0 5px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                ...(item.style || { background: item.color })
                            }}
                            onClick={item.onClick}
                        >
                            <div className="card-body d-flex flex-column justify-content-center align-items-center" style={{ padding: '10px' }}>
                                <h5 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '5px' }}>{item.title}</h5>
                                <div className="card-text" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, textAlign: 'center' }}>{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', height: 'calc(100% - 150px)' }}>
                    {charts.map((item, index) => (
                        <div key={index} style={{ width: '50%', height: '50%', padding: '5px' }}>
                            <div
                                className="card h-100"
                                style={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                }}
                                onClick={() => setExpandedChart(item.id)}
                            >
                                <div className="card-body" style={{ position: 'relative', padding: '10px' }}>
                                    <h5 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#333' }}>{item.title}</h5>
                                    <div style={{ height: 'calc(100% - 25px)' }}>{item.chart}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {expandedChart && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setExpandedChart(null)}
                >
                    <div
                        style={{
                            width: '85%',
                            height: '85%',
                            backgroundColor: 'white',
                            borderRadius: '15px',
                            padding: '25px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '25px', fontSize: '1.8rem' }}>
                            {charts.find(c => c.id === expandedChart)?.title}
                        </h2>
                        <div style={{ height: 'calc(100% - 70px)' }}>
                            {charts.find(c => c.id === expandedChart)?.chart}
                        </div>
                    </div>
                </div>
            )}

            {isLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(255,255,255,0.8)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div className="loader"></div>
                </div>
            )}

            <style>
                {`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .loader {
          border: 8px solid #f3f3f3;
          border-top: 8px solid #3498db;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
            </style>
        </div>
    );
};

export default Home;
