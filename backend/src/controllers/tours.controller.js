const pool = require('../config/db');

const getTours = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tours ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

const createTour = async (req, res) => {
  const { title, name, location, subtitle, price, unit, duration, description, features, is_popular, image_url } = req.body;
  const tourName = title || name;
  const tourSubtitle = location || subtitle;
  const tourFeatures = description ? [description] : features;
  try {
    const result = await pool.query(
      'INSERT INTO tours (name, subtitle, price, unit, duration, features, is_popular, image_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [tourName, tourSubtitle, price, unit, duration, JSON.stringify(tourFeatures || []), is_popular ? true : false, image_url]
    );
    res.status(201).json({ success: true, tour: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const updateTour = async (req, res) => {
  const { id } = req.params;
  const { title, name, location, subtitle, price, unit, duration, description, features, is_popular, image_url } = req.body;
  const tourName = title || name;
  const tourSubtitle = location || subtitle;
  const tourFeatures = description ? [description] : features;
  try {
    const result = await pool.query(
      'UPDATE tours SET name=$1, subtitle=$2, price=$3, unit=$4, duration=$5, features=$6, is_popular=$7, image_url=$8 WHERE id=$9 RETURNING *',
      [tourName, tourSubtitle, price, unit, duration, JSON.stringify(tourFeatures || []), is_popular ? true : false, image_url, id]
    );
    res.json({ success: true, tour: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const deleteTour = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tours WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  getTours,
  createTour,
  updateTour,
  deleteTour
};
