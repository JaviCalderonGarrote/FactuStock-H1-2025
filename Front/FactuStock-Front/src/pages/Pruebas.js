import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Sidebar from "../components/Sidebar";
import {FaSearch, FaPlusCircle, FaPencilAlt, FaSave, FaDownload, FaChevronLeft, FaChevronRight, FaEllipsisH} from "react-icons/fa";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";

const EstadoGasto = {
    RECIBIDO: "RECIBIDO",
    COMPLETADO: "COMPLETADO",
    ERROR: "ERROR"
};

const FormaPagoGasto = {
    EFECTIVO: "EFECTIVO",
    TARJETA: "TARJETA",
    TRANSFERENCIA: "TRANSFERENCIA",
    NO_PAGADA: "NO_PAGADA"
};

const GastosComponent = () => {
    // ... (mantén todos los estados y funciones como estaban)

    const renderPaginationButtons = () => {
        const buttons = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => paginate(i)}
                        className={`pagination-button ${currentPage === i ? 'active' : ''}`}
                    >
                        {i}
                    </button>
                );
            }
        } else {
            buttons.push(
                <button
                    key={1}
                    onClick={() => paginate(1)}
                    className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}
                >
                    1
                </button>
            );
            buttons.push(
                <button
                    key={2}
                    onClick={() => paginate(2)}
                    className={`pagination-button ${currentPage === 2 ? 'active' : ''}`}
                >
                    2
                </button>
            );

            if (currentPage > 3) {
                buttons.push(<span key="ellipsis1" className="pagination-ellipsis"><FaEllipsisH /></span>);
            }

            if (currentPage !== 1 && currentPage !== 2 && currentPage !== totalPages) {
                buttons.push(
                    <button
                        key={currentPage}
                        onClick={() => paginate(currentPage)}
                        className="pagination-button active"
                    >
                        {currentPage}
                    </button>
                );
            }

            if (currentPage < totalPages - 2) {
                buttons.push(<span key="ellipsis2" className="pagination-ellipsis"><FaEllipsisH /></span>);
            }

            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => paginate(totalPages)}
                    className={`pagination-button ${currentPage === totalPages ? 'active' : ''}`}
                >
                    {totalPages}
                </button>
            );
        }
        return buttons;
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="container mt-4">
                <h2 className="text-center mb-4" style={{ borderBottom: '2px solid #a7c5eb', paddingBottom: '10px' }}>
                    Registro de Gastos
                </h2>

                {error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : (
                    <>
                        {/* ... (mantén el botón de añadir y el buscador como estaban) */}

                        <div className="table-responsive">
                            <table className="table table-hover">
                                {/* ... (mantén la estructura de la tabla como estaba) */}
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#6f9fd7',
                                                border: 'none'
                                            }}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                    </li>
                                    {renderPaginationButtons()}
                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: '#6f9fd7',
                                                border: 'none'
                                            }}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}

                        {/* ... (mantén los modales como estaban) */}
                    </>
                )}
            </div>
        </div>
    );
};

export default GastosComponent;
