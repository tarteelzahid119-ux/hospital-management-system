// Simulated notification service.
// In a real production system, this would integrate with an SMS/email/push provider
// (e.g. Twilio, SendGrid, Firebase Cloud Messaging). For this capstone project,
// notifications are simulated via structured console logs, and stored in-memory
// so they can be inspected/retrieved through an API if needed.

const notificationLog = [];

const sendAppointmentNotification = ({ type, appointment, patientName, doctorName }) => {
  const notification = {
    id: notificationLog.length + 1,
    type, // 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'REMINDER' | 'COMPLETED'
    message: `[${type}] Appointment for patient "${patientName}" with Dr. ${doctorName} on ${
      appointment.date.toISOString ? appointment.date.toISOString().split('T')[0] : appointment.date
    } at ${appointment.startTime}`,
    appointmentId: appointment._id,
    createdAt: new Date(),
  };

  notificationLog.push(notification);
  // eslint-disable-next-line no-console
  console.log(`[NOTIFICATION] ${notification.message}`);
  return notification;
};

const getRecentNotifications = (limit = 20) => {
  return notificationLog.slice(-limit).reverse();
};

module.exports = { sendAppointmentNotification, getRecentNotifications };
