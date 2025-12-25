import React, { useState, useEffect } from 'react';

export const PatenteForm = ({ patente, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    torre: '',
    departamento: '',
    nombre: '',
    rut: '',
    estado: 'propietario',
    patente: ''
  });

  useEffect(() => {
    if (patente) {
      setFormData({
        torre: patente.torre || '',
        departamento: patente.departamento || '',
        nombre: patente.nombre || '',
        rut: patente.rut || '',
        estado: patente.estado || 'propietario',
        patente: patente.patente || ''
      });
    }
  }, [patente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'patente' ? value.toUpperCase() : value
    }));
  };

  const formatRut = (value) => {
    const cleaned = value.replace(/[^0-9kK]/g, '');
    if (cleaned.length <= 1) return cleaned;
    
    const rut = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1);
    
    return `${rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
  };

  const handleRutChange = (e) => {
    const formatted = formatRut(e.target.value);
    setFormData(prev => ({
      ...prev,
      rut: formatted
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.torre || !formData.nombre || !formData.rut || !formData.patente) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {patente ? 'Editar Patente' : 'Nueva Patente'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Torre
          </label>
          <input
            type="text"
            name="torre"
            value={formData.torre}
            onChange={handleChange}
            placeholder="Ej: Torre A"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Departamento
          </label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            placeholder="Ej: 101"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre completo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RUT
          </label>
          <input
            type="text"
            name="rut"
            value={formData.rut}
            onChange={handleRutChange}
            placeholder="12.345.678-9"
            maxLength="12"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="propietario">Propietario</option>
            <option value="visitante">Visitante</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patente
          </label>
          <input
            type="text"
            name="patente"
            value={formData.patente}
            onChange={handleChange}
            placeholder="Ej: ABCD12"
            maxLength="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            {patente ? 'Actualizar' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
};