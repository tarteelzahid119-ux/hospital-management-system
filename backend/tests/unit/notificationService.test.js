const {
  sendAppointmentNotification,
  getRecentNotifications,
} = require('../../services/notificationService');

describe('notificationService', () => {
  it('logs and stores a notification for an appointment event', () => {
    const appointment = {
      _id: 'appt1',
      date: new Date('2026-09-01'),
      startTime: '10:00',
    };

    const notification = sendAppointmentNotification({
      type: 'CREATED',
      appointment,
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
    });

    expect(notification.type).toBe('CREATED');
    expect(notification.message).toContain('John Doe');
    expect(notification.message).toContain('Dr. Smith');
  });

  it('returns the most recent notifications first, up to the given limit', () => {
    const appointment = {
      _id: 'appt2',
      date: new Date('2026-09-02'),
      startTime: '11:00',
    };

    for (let i = 0; i < 5; i += 1) {
      sendAppointmentNotification({
        type: 'REMINDER',
        appointment,
        patientName: `Patient ${i}`,
        doctorName: 'Dr. Jones',
      });
    }

    const recent = getRecentNotifications(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].message).toContain('Patient 4');
  });
});
