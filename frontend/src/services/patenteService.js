import { API_BASE_URL } from '../config/api';

class PatenteService {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.torre) params.append('torre', filters.torre);
    
    const response = await fetch(`${API_BASE_URL}/patentes?${params}`);
    if (!response.ok) throw new Error('Error al obtener patentes');
    return response.json();
  }

  async getById(id) {
    const response = await fetch(`${API_BASE_URL}/patentes/${id}`);
    if (!response.ok) throw new Error('Error al obtener patente');
    return response.json();
  }

  async create(data) {
    const response = await fetch(`${API_BASE_URL}/patentes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear patente');
    }
    return response.json();
  }

  async update(id, data) {
    const response = await fetch(`${API_BASE_URL}/patentes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar patente');
    }
    return response.json();
  }

  async delete(id) {
    const response = await fetch(`${API_BASE_URL}/patentes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar patente');
    return response.json();
  }

  async getStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    return response.json();
  }
}

export default new PatenteService();