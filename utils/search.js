function buildSearchFilter(query, fields = []) {
  const filter = {};
  const search = query.search || query.q;

  if (search && fields.length > 0) {
    filter.$or = fields.map((field) => ({
      [field]: { $regex: search, $options: 'i' }
    }));
  }

  return filter;
}

function addArrayFilter(filter, field, value) {
  if (!value) return filter;
  const values = Array.isArray(value) ? value : String(value).split(',');
  filter[field] = { $in: values.map((item) => item.trim()).filter(Boolean) };
  return filter;
}

module.exports = { buildSearchFilter, addArrayFilter };
