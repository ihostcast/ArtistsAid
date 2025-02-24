const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');

// All routes require authentication
router.use(authenticate);

// Get financial data
router.get('/organizations/:id/finances', 
  checkRole(['admin', 'org_admin']), 
  financeController.getFinancialData
);

// Get transactions
router.get('/organizations/:id/transactions', 
  checkRole(['admin', 'org_admin']), 
  financeController.getTransactions
);

// Connect bank account
router.post('/organizations/:id/bank-account', 
  checkRole(['admin', 'org_admin']), 
  financeController.connectBankAccount
);

// Process withdrawal
router.post('/organizations/:id/withdraw', 
  checkRole(['admin', 'org_admin']), 
  financeController.processWithdrawal
);

module.exports = router;
