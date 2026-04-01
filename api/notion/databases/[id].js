const { notionFetch, handleError } = require('../_helper')

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const data = await notionFetch(`/databases/${req.query.id}`)
    res.json(data)
  } catch (err) {
    handleError(err, res)
  }
}
