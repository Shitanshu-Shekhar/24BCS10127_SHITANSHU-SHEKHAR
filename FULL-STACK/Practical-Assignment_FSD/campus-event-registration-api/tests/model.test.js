const test = require('node:test');
const assert = require('node:assert/strict');
const Registration = require('../models/Registration');

test('CAMPUS50 computes half price', async () => {
  const doc = new Registration({ studentName: 'Aarav Sharma', collegeEmail: 'aarav@college.edu', rollNumber: '24CSB102', eventType: 'CODING_HACKATHON', teamSize: 2, ticketPrice: 600, discountCode: 'CAMPUS50' });
  await doc.validate();
  assert.equal(doc.finalAmount, 300);
});

test('EARLYBIRD never produces a negative amount', async () => {
  const doc = new Registration({ studentName: 'Aarav Sharma', collegeEmail: 'aarav@college.edu', rollNumber: '24CSB102', eventType: 'GAMING', teamSize: 1, ticketPrice: 50, discountCode: 'EARLYBIRD' });
  await doc.validate();
  assert.equal(doc.finalAmount, 0);
});

test('AI workshop requires an individual registration', async () => {
  const doc = new Registration({ studentName: 'Aarav Sharma', collegeEmail: 'aarav@college.edu', rollNumber: '24CSB102', eventType: 'AI_WORKSHOP', teamSize: 2, ticketPrice: 100 });
  await assert.rejects(doc.validate(), /AI Workshop only permits individual registrations/);
});
