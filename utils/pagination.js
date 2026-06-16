function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

async function paginate(model, filter = {}, query = {}, options = {}) {
  const { page, limit, skip } = getPagination(query);
  const sort = options.sort || query.sort || '-createdAt';
  const projection = options.projection || null;

  let dbQuery = model.find(filter, projection).sort(sort).skip(skip).limit(limit);
  if (options.populate) dbQuery = dbQuery.populate(options.populate);
  if (options.select) dbQuery = dbQuery.select(options.select);

  const [items, total] = await Promise.all([dbQuery, model.countDocuments(filter)]);
  const pages = Math.ceil(total / limit) || 1;

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1
    }
  };
}

module.exports = { getPagination, paginate };
