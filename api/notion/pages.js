const { notionFetch, handleError } = require('./_helper')

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  try {
    const data = await notionFetch('/pages', 'POST', req.body)
    res.json(data)
  } catch (err) {
    handleError(err, res)
  }
}
