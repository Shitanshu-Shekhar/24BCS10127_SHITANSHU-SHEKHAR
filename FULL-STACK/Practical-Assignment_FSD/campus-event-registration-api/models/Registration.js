const mongoose = require('mongoose');

const EVENTS = ['CODING_HACKATHON', 'AI_WORKSHOP', 'ROBOTICS', 'GAMING'];
const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED'];
const COLLEGE_EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.(edu|ac\.in)$/i;
const ROLL_NUMBER_REGEX = /^[A-Z0-9]{8,10}$/;

function calculateFinalAmount(ticketPrice, discountCode) {
  if (!discountCode) return ticketPrice;
  if (discountCode === 'CAMPUS50') return Math.max(0, ticketPrice * 0.5);
  if (discountCode === 'EARLYBIRD') return Math.max(0, ticketPrice - 100);
  throw new Error('Invalid discount code');
}

const registrationSchema = new mongoose.Schema({
  studentName: {
    type: String, required: [true, 'Student name is required'], trim: true,
    minlength: [3, 'Student name must be at least 3 characters'],
    maxlength: [50, 'Student name cannot exceed 50 characters']
  },
  collegeEmail: {
    type: String, required: [true, 'College email is required'], unique: true,
    trim: true, lowercase: true,
    validate: { validator: value => COLLEGE_EMAIL_REGEX.test(value),
      message: 'Must be a valid college email ending in .edu or .ac.in' }
  },
  rollNumber: {
    type: String, required: [true, 'Roll number is required'], uppercase: true, trim: true,
    match: [ROLL_NUMBER_REGEX, 'Roll number must be 8 to 10 alphanumeric characters']
  },
  eventType: { type: String, required: [true, 'Event type is required'], enum: EVENTS },
  teamSize: {
    type: Number, required: [true, 'Team size is required'], min: [1, 'Team size must be at least 1'],
    max: [4, 'Team size cannot exceed 4'],
    validate: { validator: Number.isInteger, message: 'Team size must be an integer' }
  },
  ticketPrice: { type: Number, required: [true, 'Ticket price is required'], min: [0, 'Ticket price cannot be negative'] },
  discountCode: { type: String, trim: true, uppercase: true, default: undefined,
    validate: { validator: value => value == null || ['CAMPUS50', 'EARLYBIRD'].includes(value), message: 'Invalid discount code' } },
  finalAmount: { type: Number, required: true, min: [0, 'Final amount cannot be negative'] },
  status: { type: String, enum: STATUSES, default: 'PENDING' },
  registrationDate: { type: Date, default: Date.now,
    validate: { validator: value => value <= new Date(), message: 'Registration date cannot be in the future' } }
}, { timestamps: true, versionKey: false });

registrationSchema.pre('validate', function(next) {
  if (this.eventType === 'AI_WORKSHOP' && this.teamSize !== 1) {
    this.invalidate('teamSize', 'AI Workshop only permits individual registrations');
  }
  if (this.discountCode && !['CAMPUS50', 'EARLYBIRD'].includes(this.discountCode)) {
    this.invalidate('discountCode', 'Invalid discount code');
  }
  if (this.ticketPrice != null) {
    try { this.finalAmount = calculateFinalAmount(this.ticketPrice, this.discountCode); }
    catch (error) { this.invalidate('discountCode', error.message); }
  }
  next();
});

registrationSchema.statics.EVENTS = EVENTS;
registrationSchema.statics.STATUSES = STATUSES;
module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
