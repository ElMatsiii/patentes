import React, { useState } from 'react';
import { Plus, Search, Car } from 'lucide-react';
import { usePatentes } from './hooks/usePatentes';
import { PatenteForm } from './components/PatenteForm';
import { PatenteList } from './components/PatenteList';

export default function App() {
  const { patentes, loading, error, createPatente, updatePatente, deletePatente, fetchPatentes } = usePatentes();
  const [showForm, setShowForm] = useState(false);
  const [editingPatente, setEditingPatente] = useState(null);
  const [search, setSearch] = useState('');

  const handleSubmit = async (data) => {
    try {
      if (editingPatente) {
        await updatePatente(editingPatente.id, data);
      } else {
        await createPatente(data);
      }
      setShowForm(false);
      setEditingPatente(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (patente) => {
    setEditingPatente(patente);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta patente?')) {
      await deletePatente(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatente(null);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatentes({ search: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Car size={32} />
            <h1 className="text-2xl font-bold">Gestión de Patentes</h1>
          </div>
          <p className="text-blue-100">Condominio - Registro de Vehículos</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por torre, propietario, depto o patente..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            {showForm ? 'Cancelar' : 'Agregar Patente'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <PatenteForm
            patente={editingPatente}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        )}

        <PatenteList
          patentes={patentes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />

        {patentes.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">{patentes.length} patentes</p>
          </div>
        )}
      </div>
    </div>
  );
}