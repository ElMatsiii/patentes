import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const AlertasList = ({ alertas, onMarcarVista }) => {
  if (alertas.length === 0) return null;

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

  const calcularTiempoExcedido = (horarioEntrada) => {
    const entrada = new Date(horarioEntrada);
    const ahora = new Date();
    const tiempoTranscurrido = ahora - entrada;
    const horasExcedidas = (tiempoTranscurrido / (1000 * 60 * 60)) - 6;
    
    const horas = Math.floor(horasExcedidas);
    const minutos = Math.floor((horasExcedidas - horas) * 60);
    
    return { horas, minutos };
  };

  return (
    <div className="mb-6 space-y-3">
      <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
        <AlertTriangle size={24} />
        Alertas de Visitantes
      </h3>
      {alertas.map((alerta) => {
        const tiempoExcedido = calcularTiempoExcedido(alerta.horario_entrada);
        
        return (
          <div 
            key={alerta.id} 
            className="bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="font-bold text-red-700">
                    Tiempo excedido: {tiempoExcedido.horas}h {tiempoExcedido.minutos}m
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-gray-800">
                    {alerta.nombre} - {alerta.patente}
                  </p>
                  <p className="text-gray-700">
                    {alerta.torre} {alerta.departamento ? `- Depto ${alerta.departamento}` : ''}
                  </p>
                  <p className="text-gray-600">
                    RUT: {alerta.rut}
                  </p>
                  <p className="text-gray-600">
                    Entrada: {formatFecha(alerta.horario_entrada)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onMarcarVista(alerta.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Marcar como vista"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};