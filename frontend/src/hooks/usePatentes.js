import { useState, useEffect, useCallback } from 'react';
import patenteService from '../services/patenteService';

export const usePatentes = () => {
  const [patentes, setPatentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatentes = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await patenteService.getAll(filters);
      setPatentes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatentes();
  }, [fetchPatentes]);

  const createPatente = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await patenteService.create(data);
      await fetchPatentes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePatente = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      await patenteService.update(id, data);
      await fetchPatentes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePatente = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await patenteService.delete(id);
      await fetchPatentes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    patentes,
    loading,
    error,
    fetchPatentes,
    createPatente,
    updatePatente,
    deletePatente
  };
};