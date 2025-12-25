import React, { useState, useEffect } from 'react';
import { Plus, Search, Car, AlertTriangle, Clock } from 'lucide-react';
import { usePatentes } from './hooks/usePatentes';
import { PatenteForm } from './components/PatenteForm';
import { PatenteList } from './components/PatenteList';
import { AlertasList } from './components/AlertasList';

export default function App() {
  const { patentes, loading, error, createPatente, updatePatente, deletePatente, registrarSalida, fetchPatentes } = usePatentes();
  const [showForm, setShowForm] = useState(false);
  const [editingPatente, setEditingPatente] = useState(null);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [alertas, setAlertas] = useState([]);
  const [stats, setStats] = useState(null);

  const checkAlertas = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/patentes/alertas');
      const data = await response.json();
      setAlertas(data);
    } catch (err) {
      console.error('Error al verificar alertas:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
    }
  };

  useEffect(() => {
    checkAlertas();
    fetchStats();
    const interval = setInterval(() => {
      checkAlertas();
      fetchStats();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (data) => {
    try {
      if (editingPatente) {
        await updatePatente(editingPatente.id, data);
      } else {
        await createPatente(data);
      }
      setShowForm(false);
      setEditingPatente(null);
      fetchStats();
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
      fetchStats();
    }
  };

  const handleSalida = async (id) => {
    if (window.confirm('¿Registrar salida del vehículo?')) {
      await registrarSalida(id);
      fetchStats();
      checkAlertas();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatente(null);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchPatentes({ search: e.target.value, estado: filterEstado });
  };

  const handleFilterEstado = (estado) => {
    setFilterEstado(estado);
    fetchPatentes({ search, estado });
  };

  const marcarAlertaVista = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/patentes/${id}/marcar-alerta`, {
        method: 'POST'
      });
      checkAlertas();
      fetchStats();
    } catch (err) {
      console.error('Error al marcar alerta:', err);
    }
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
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Total Activos</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total_activos}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Propietarios</div>
              <div className="text-2xl font-bold text-green-600">{stats.total_propietarios}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Visitantes</div>
              <div className="text-2xl font-bold text-purple-600">{stats.total_visitantes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600 mb-1">Alertas</div>
              <div className="text-2xl font-bold text-red-600">{stats.alertas_pendientes}</div>
            </div>
          </div>
        )}

        {alertas.length > 0 && (
          <AlertasList alertas={alertas} onMarcarVista={marcarAlertaVista} />
        )}

        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por torre, nombre, RUT, depto o patente..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleFilterEstado('')}
              className={`flex-1 py-2 rounded-lg font-medium ${!filterEstado ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => handleFilterEstado('propietario')}
              className={`flex-1 py-2 rounded-lg font-medium ${filterEstado === 'propietario' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Propietarios
            </button>
            <button
              onClick={() => handleFilterEstado('visitante')}
              className={`flex-1 py-2 rounded-lg font-medium ${filterEstado === 'visitante' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Visitantes
            </button>
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
          onSalida={handleSalida}
          loading={loading}
        />

        {patentes.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            <p className="text-sm">{patentes.length} vehículos en estacionamiento</p>
          </div>
        )}
      </div>
    </div>
  );
}