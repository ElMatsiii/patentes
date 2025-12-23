// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Conectado a Neon Database');
});

const initDB = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS patentes (
      id SERIAL PRIMARY KEY,
      torre VARCHAR(50) NOT NULL,
      departamento VARCHAR(50),
      propietario VARCHAR(255) NOT NULL,
      patente VARCHAR(10) NOT NULL UNIQUE,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_torre ON patentes(torre);
    CREATE INDEX IF NOT EXISTS idx_patente ON patentes(patente);
  `;
  
  try {
    await pool.query(query);
    console.log('Tablas inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar tablas:', error);
  }
};

app.get('/api/patentes', async (req, res) => {
  const { search, torre } = req.query;
  
  try {
    let query = 'SELECT * FROM patentes WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        LOWER(torre) LIKE $${paramCount} OR 
        LOWER(departamento) LIKE $${paramCount} OR 
        LOWER(propietario) LIKE $${paramCount} OR 
        LOWER(patente) LIKE $${paramCount}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    if (torre) {
      query += ` AND torre = $${paramCount}`;
      params.push(torre);
    }

    query += ' ORDER BY torre, departamento';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener patentes:', error);
    res.status(500).json({ error: 'Error al obtener patentes' });
  }
});

app.get('/api/patentes/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM patentes WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener patente:', error);
    res.status(500).json({ error: 'Error al obtener patente' });
  }
});

app.post('/api/patentes', async (req, res) => {
  const { torre, departamento, propietario, patente } = req.body;

  if (!torre || !propietario || !patente) {
    return res.status(400).json({ 
      error: 'Torre, propietario y patente son obligatorios' 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patentes (torre, departamento, propietario, patente) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [torre, departamento || null, propietario, patente.toUpperCase()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Esta patente ya está registrada' });
    }
    console.error('Error al crear patente:', error);
    res.status(500).json({ error: 'Error al crear patente' });
  }
});

app.put('/api/patentes/:id', async (req, res) => {
  const { id } = req.params;
  const { torre, departamento, propietario, patente } = req.body;

  if (!torre || !propietario || !patente) {
    return res.status(400).json({ 
      error: 'Torre, propietario y patente son obligatorios' 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE patentes 
       SET torre = $1, departamento = $2, propietario = $3, patente = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [torre, departamento || null, propietario, patente.toUpperCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Esta patente ya está registrada' });
    }
    console.error('Error al actualizar patente:', error);
    res.status(500).json({ error: 'Error al actualizar patente' });
  }
});

app.delete('/api/patentes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM patentes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }

    res.json({ message: 'Patente eliminada correctamente', patente: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar patente:', error);
    res.status(500).json({ error: 'Error al eliminar patente' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_patentes,
        COUNT(DISTINCT torre) as total_torres,
        COUNT(DISTINCT propietario) as total_propietarios
      FROM patentes
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

app.listen(PORT, async () => {
  await initDB();
  console.log(`Servidor corriendo en puerto ${PORT}`);
});