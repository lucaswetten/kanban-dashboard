module.exports = function handler(req, res) {
  res.json({ status: 'ok', notion: !!process.env.NOTION_API_KEY })
}
