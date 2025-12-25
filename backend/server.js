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
      nombre VARCHAR(255) NOT NULL,
      rut VARCHAR(20) NOT NULL,
      estado VARCHAR(20) NOT NULL CHECK (estado IN ('propietario', 'visitante')),
      patente VARCHAR(10) NOT NULL,
      horario_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      horario_salida TIMESTAMP,
      alerta_enviada BOOLEAN DEFAULT FALSE,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_torre ON patentes(torre);
    CREATE INDEX IF NOT EXISTS idx_patente ON patentes(patente);
    CREATE INDEX IF NOT EXISTS idx_estado ON patentes(estado);
    CREATE INDEX IF NOT EXISTS idx_horario_entrada ON patentes(horario_entrada);
  `;
  
  try {
    await pool.query(query);
    console.log('Tablas inicializadas correctamente');
  } catch (error) {
    console.error('Error al inicializar tablas:', error);
  }
};

app.get('/api/patentes', async (req, res) => {
  const { search, torre, estado } = req.query;
  
  try {
    let query = 'SELECT * FROM patentes WHERE horario_salida IS NULL';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        LOWER(torre) LIKE $${paramCount} OR 
        LOWER(departamento) LIKE $${paramCount} OR 
        LOWER(nombre) LIKE $${paramCount} OR 
        LOWER(rut) LIKE $${paramCount} OR 
        LOWER(patente) LIKE $${paramCount}
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    if (torre) {
      query += ` AND torre = $${paramCount}`;
      params.push(torre);
      paramCount++;
    }

    if (estado) {
      query += ` AND estado = $${paramCount}`;
      params.push(estado);
    }

    query += ' ORDER BY horario_entrada DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener patentes:', error);
    res.status(500).json({ error: 'Error al obtener patentes' });
  }
});

app.get('/api/patentes/alertas', async (req, res) => {
  try {
    const query = `
      SELECT * FROM patentes 
      WHERE estado = 'visitante' 
      AND horario_salida IS NULL
      AND horario_entrada <= NOW() - INTERVAL '6 hours'
      AND alerta_enviada = FALSE
      ORDER BY horario_entrada ASC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

app.post('/api/patentes/:id/marcar-alerta', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'UPDATE patentes SET alerta_enviada = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al marcar alerta:', error);
    res.status(500).json({ error: 'Error al marcar alerta' });
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
  const { torre, departamento, nombre, rut, estado, patente } = req.body;

  if (!torre || !nombre || !rut || !estado || !patente) {
    return res.status(400).json({ 
      error: 'Torre, nombre, RUT, estado y patente son obligatorios' 
    });
  }

  if (!['propietario', 'visitante'].includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado debe ser "propietario" o "visitante"' 
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO patentes (torre, departamento, nombre, rut, estado, patente) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [torre, departamento || null, nombre, rut, estado, patente.toUpperCase()]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear patente:', error);
    res.status(500).json({ error: 'Error al crear patente' });
  }
});

app.put('/api/patentes/:id', async (req, res) => {
  const { id } = req.params;
  const { torre, departamento, nombre, rut, estado, patente } = req.body;

  if (!torre || !nombre || !rut || !estado || !patente) {
    return res.status(400).json({ 
      error: 'Torre, nombre, RUT, estado y patente son obligatorios' 
    });
  }

  if (!['propietario', 'visitante'].includes(estado)) {
    return res.status(400).json({ 
      error: 'Estado debe ser "propietario" o "visitante"' 
    });
  }

  try {
    const result = await pool.query(
      `UPDATE patentes 
       SET torre = $1, departamento = $2, nombre = $3, rut = $4, estado = $5, patente = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [torre, departamento || null, nombre, rut, estado, patente.toUpperCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar patente:', error);
    res.status(500).json({ error: 'Error al actualizar patente' });
  }
});

app.post('/api/patentes/:id/salida', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'UPDATE patentes SET horario_salida = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patente no encontrada' });
    }

    res.json({ message: 'Salida registrada correctamente', patente: result.rows[0] });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ error: 'Error al registrar salida' });
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
        COUNT(*) FILTER (WHERE horario_salida IS NULL) as total_activos,
        COUNT(*) FILTER (WHERE estado = 'propietario' AND horario_salida IS NULL) as total_propietarios,
        COUNT(*) FILTER (WHERE estado = 'visitante' AND horario_salida IS NULL) as total_visitantes,
        COUNT(*) FILTER (WHERE estado = 'visitante' AND horario_entrada <= NOW() - INTERVAL '6 hours' AND horario_salida IS NULL AND alerta_enviada = FALSE) as alertas_pendientes
      FROM patentes
    `);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Backend accesible en: http://192.168.1.21:${PORT}`);
});
