using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class ReminderJobService : IReminderJobService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly INotificationService _notificationService;

        public ReminderJobService(PrivateHospitalDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task SendAppointmentRemindersAsync()
        {
            var windowStart = DateTime.UtcNow.AddHours(24);
            var windowEnd = DateTime.UtcNow.AddHours(25); // janela de 1h, job corre de hora a hora

            var upcoming = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Where(a => a.Status == AppointmentStatus.Scheduled &&
                            a.ScheduledAt >= windowStart && a.ScheduledAt < windowEnd)
                .ToListAsync();

            foreach (var appointment in upcoming)
            {
                try
                {
                    await _notificationService.CreateAsync(new CreateNotificationDto
                    {
                        PatientId = appointment.PatientId,
                        Message = $"Reminder: you have an appointment with {appointment.Doctor?.FullName} on {appointment.ScheduledAt:dd/MM/yyyy HH:mm}."
                    });
                }
                catch
                {
                    // ignore notification errors
                }
            }
        }

        public async Task FlagOverdueInvoicesAsync()
        {
            var overdueThreshold = DateTime.UtcNow.AddDays(-30);

            var overdue = await _context.Invoices
                .Include(i => i.Patient)
                .Where(i => i.Status == InvoiceStatus.Pending && i.IssuedAt < overdueThreshold)
                .ToListAsync();

            foreach (var invoice in overdue)
            {
                try
                {
                    await _notificationService.CreateAsync(new CreateNotificationDto
                    {
                        PatientId = invoice.PatientId,
                        Message = $"Your invoice for {invoice.ProcedureType} (€{invoice.PatientAmount}) is overdue. Please arrange payment."
                    });
                }
                catch
                {
                    // ignore notification errors
                }
            }
        }
    }
}
