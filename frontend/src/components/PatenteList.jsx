import React from 'react';
import { Edit2, Trash2, Car } from 'lucide-react';

export const PatenteList = ({ patentes, onEdit, onDelete, loading }) => {
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
      {patentes.map((patente) => (
        <div key={patente.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {patente.torre}
                </span>
                {patente.departamento && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Depto {patente.departamento}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {patente.propietario}
              </h3>
              <div className="flex items-center gap-2">
                <Car size={18} className="text-gray-400" />
                <span className="text-2xl font-bold text-indigo-600 tracking-wider">
                  {patente.patente}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(patente)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => onDelete(patente.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};