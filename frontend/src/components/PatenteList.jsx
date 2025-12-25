import React from 'react';
import { Edit2, Trash2, Car, LogOut, Clock, AlertTriangle } from 'lucide-react';

export const PatenteList = ({ patentes, onEdit, onDelete, onSalida, loading }) => {
  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoRestante = (horarioEntrada) => {
    const entrada = new Date(horarioEntrada);
    const ahora = new Date();
    const tiempoTranscurrido = ahora - entrada;
    const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);
    const horasRestantes = Math.max(0, 6 - horasTranscurridas);
    
    const horas = Math.floor(horasRestantes);
    const minutos = Math.floor((horasRestantes - horas) * 60);
    
    return {
      horas,
      minutos,
      vencido: horasRestantes <= 0,
      cercaVencimiento: horasRestantes <= 1 && horasRestantes > 0
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (patentes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <Car size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-lg">No hay patentes registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patentes.map((patente) => {
        const tiempoRestante = patente.estado === 'visitante' 
          ? calcularTiempoRestante(patente.horario_entrada)
          : null;

        return (
          <div 
            key={patente.id} 
            className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
              tiempoRestante?.vencido ? 'border-2 border-red-500' : 
              tiempoRestante?.cercaVencimiento ? 'border-2 border-yellow-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {patente.torre}
                  </span>
                  {patente.departamento && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      Depto {patente.departamento}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    patente.estado === 'propietario' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {patente.estado === 'propietario' ? 'Propietario' : 'Visitante'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {patente.nombre}
                </h3>

                <p className="text-sm text-gray-600 mb-2">
                  RUT: {patente.rut}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <Car size={18} className="text-gray-400" />
                  <span className="text-2xl font-bold text-indigo-600 tracking-wider">
                    {patente.patente}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>Entrada: {formatFecha(patente.horario_entrada)}</span>
                </div>

                {tiempoRestante && (
                  <div className={`mt-2 flex items-center gap-2 text-sm font-medium ${
                    tiempoRestante.vencido ? 'text-red-600' :
                    tiempoRestante.cercaVencimiento ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {tiempoRestante.vencido ? (
                      <>
                        <AlertTriangle size={16} />
                        <span>Tiempo excedido</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} />
                        <span>
                          Tiempo restante: {tiempoRestante.horas}h {tiempoRestante.minutos}m
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onSalida(patente.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Registrar salida"
                >
                  <LogOut size={20} />
                </button>
                <button
                  onClick={() => onEdit(patente)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => onDelete(patente.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};