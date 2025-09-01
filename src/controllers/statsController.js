import { ApiStat } from '../database/database.js';

const groupBy = (arr, keyFn) => arr.reduce((acc, item) => {
  const key = keyFn(item);
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {});

const statsController = {
  async requests(req, res) {
    const records = await ApiStat.findAll({ attributes: ['endpointAccess', 'requestMethod'] });
    const grouped = groupBy(records.map(r => r.get({ plain: true })), r => r.endpointAccess);
    const breakdown = Object.fromEntries(Object.entries(grouped).map(([endpoint, arr]) => {
      const byMethod = groupBy(arr, a => a.requestMethod);
      const methodCounts = Object.fromEntries(Object.entries(byMethod).map(([m, list]) => [m, list.length]));
      return [endpoint, methodCounts];
    }));
    const total = records.length;
    return res.json({ total_requests: total, breakdown });
  },

  async responseTimes(req, res) {
    const records = await ApiStat.findAll({ attributes: ['endpointAccess', 'responseTimeMs'] });
    const plain = records.map(r => r.get({ plain: true }));
    const grouped = groupBy(plain, r => r.endpointAccess);
    const result = Object.fromEntries(Object.entries(grouped).map(([endpoint, list]) => {
      const times = list.map(i => i.responseTimeMs);
      const sum = times.reduce((a, b) => a + b, 0);
      const avg = times.length ? Math.round(sum / times.length) : 0;
      const min = times.length ? Math.min(...times) : 0;
      const max = times.length ? Math.max(...times) : 0;
      return [endpoint, { avg, min, max }];
    }));
    return res.json(result);
  },

  async statusCodes(req, res) {
    const records = await ApiStat.findAll({ attributes: ['statusCode'] });
    const counts = records.map(r => r.statusCode)
      .reduce((acc, code) => ({ ...acc, [code]: (acc[code] || 0) + 1 }), {});
    return res.json(counts);
  },

  async popularEndpoints(req, res) {
    const records = await ApiStat.findAll({ attributes: ['endpointAccess'] });
    const counts = records.map(r => r.endpointAccess)
      .reduce((acc, ep) => ({ ...acc, [ep]: (acc[ep] || 0) + 1 }), {});
    const entries = Object.entries(counts);
    if (!entries.length) return res.json({ most_popular: null, request_count: 0 });
    const [mostEndpoint, count] = entries.sort((a, b) => b[1] - a[1])[0];
    return res.json({ most_popular: mostEndpoint, request_count: count });
  }
};

export default statsController;


