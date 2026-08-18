const test = require('node:test');
const assert = require('node:assert/strict');

// Function under test: calculateFinancialMetrics
function calculateFinancialMetrics(leads) {
  let totalRevenue = 0;
  let actualCashflow = 0;
  let pendingAR = 0;

  leads.forEach(lead => {
    const val = Number(lead.estimated_value) || 0;
    const status = String(lead.status || '').toUpperCase().trim();

    totalRevenue += val;

    if (['CONVERTED', 'THÀNH CÔNG', 'SUCCESS', 'CLOSED', 'CHỐT'].includes(status)) {
      actualCashflow += val;
    } else if (['IN_PROGRESS', 'ĐANG ĐÀM PHÁN', 'ĐANG XỬ LÝ', 'CHỜ KÝ HỢP ĐỒNG'].includes(status)) {
      pendingAR += val;
    }
  });

  const totalLeads = leads.length;
  const conversionRate = totalRevenue > 0 ? ((actualCashflow / totalRevenue) * 100).toFixed(1) : '0.0';

  const expenses = {
    tourOperations: Math.round(totalRevenue * 0.45),
    marketingSales: Math.round(totalRevenue * 0.20),
    payroll: Math.round(totalRevenue * 0.15),
    grossProfit: Math.round(totalRevenue * 0.20)
  };

  return {
    totalRevenue,
    actualCashflow,
    pendingAR,
    totalLeads,
    conversionRate: parseFloat(conversionRate),
    expenses
  };
}

test('TDD - Financial Aggregation: Correct revenue and cashflow calculation', () => {
  const sampleLeads = [
    { estimated_value: 100000000, status: 'CONVERTED' },
    { estimated_value: 50000000, status: 'THÀNH CÔNG' },
    { estimated_value: 80000000, status: 'IN_PROGRESS' },
    { estimated_value: 20000000, status: 'NEW' },
    { estimated_value: 10000000, status: 'LOST' }
  ];

  const result = calculateFinancialMetrics(sampleLeads);

  assert.equal(result.totalRevenue, 260000000);
  assert.equal(result.actualCashflow, 150000000);
  assert.equal(result.pendingAR, 80000000);
  assert.equal(result.totalLeads, 5);
  assert.equal(result.expenses.tourOperations, 260000000 * 0.45);
});

test('TDD - Financial Aggregation: Empty leads list produces zero metrics', () => {
  const result = calculateFinancialMetrics([]);
  assert.equal(result.totalRevenue, 0);
  assert.equal(result.actualCashflow, 0);
  assert.equal(result.pendingAR, 0);
  assert.equal(result.totalLeads, 0);
  assert.equal(result.conversionRate, 0);
});
