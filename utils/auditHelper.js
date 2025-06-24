const { logger } = require('./helpers');

const recordAudit = async (req, action, details) => {
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.info('AUDIT:', {
    action,
    userIp,
    details
  });
};

module.exports = { recordAudit };
