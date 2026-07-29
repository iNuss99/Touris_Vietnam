const pool = require('../config/db');

const getDestinations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

const createDestination = async (req, res) => {
  const { title, category, rating, duration, location, description, badge, tour_price, image_url } = req.body;
  const code = title ? title.toLowerCase().replace(/[^a-z0-9]/g, '') : 'newdest';
  try {
    const result = await pool.query(
      'INSERT INTO destinations (code, title, category, rating, duration, location, description, badge, tour_price, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [code, title, category, rating, duration, location, description, badge, tour_price, image_url]
    );
    res.status(201).json({ success: true, destination: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { title, category, rating, duration, location, description, badge, tour_price, image_url } = req.body;
  try {
    const result = await pool.query(
      'UPDATE destinations SET title=$1, category=$2, rating=$3, duration=$4, location=$5, description=$6, badge=$7, tour_price=$8, image_url=$9 WHERE id=$10 RETURNING *',
      [title, category, rating, duration, location, description, badge, tour_price, image_url, id]
    );
    res.json({ success: true, destination: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const deleteDestination = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM destinations WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination
};
