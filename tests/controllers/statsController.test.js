// statsController.test.js
import statsController from '../src/controllers/statsController.js';
import ApiStat from '../src/models/apiStat.js';

jest.mock('../src/models/apiStat.js');

describe('Stats Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should return API stats', async () => {
      const mockStats = [{ endpoint: '/api/players', count: 10 }];
      ApiStat.findAll.mockResolvedValue(mockStats);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await statsController.getStats(req, res);

      expect(ApiStat.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });
  });

  // Añade pruebas para otros métodos
});