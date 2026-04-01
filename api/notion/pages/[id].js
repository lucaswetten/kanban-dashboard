const { notionFetch, handleError } = require('../_helper')

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await notionFetch(`/pages/${req.query.id}`)
      res.json(data)
    } catch (err) {
      handleError(err, res)
    }
  } else if (req.method === 'PATCH') {
    try {
      const data = await notionFetch(`/pages/${req.query.id}`, 'PATCH', req.body)
      res.json(data)
    } catch (err) {
      handleError(err, res)
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
