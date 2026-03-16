const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleKeys: [String],
    scheduleValues: [Object], // DailySchedule 객체들
    colorKeys: [String],
    colorValues: [Object]     // Color 객체들
});

module.exports = mongoose.model('Calendar', CalendarSchema);