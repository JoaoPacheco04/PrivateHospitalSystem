using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly PrivateHospitalDbContext _context;

        public DashboardService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardResponseDto> GetSummaryAsync()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var totalPatients = await _context.Patients.CountAsync();
            var totalDoctors = await _context.Doctors.CountAsync();
            var totalBeds = await _context.Beds.CountAsync();
            var occupiedBeds = await _context.Beds.CountAsync(b => b.Status == BedStatus.Occupied);
            var availableBeds = await _context.Beds.CountAsync(b => b.Status == BedStatus.Available);

            var appointmentsToday = await _context.Appointments
                .CountAsync(a => a.ScheduledAt >= today && a.ScheduledAt < tomorrow && a.Status != AppointmentStatus.Cancelled);

            var activeAdmissions = await _context.Admissions.CountAsync(a => a.DischargedAt == null);

            var totalRevenue = await _context.Invoices
                .Where(i => i.Status == InvoiceStatus.Paid)
                .SumAsync(i => (decimal?)i.PatientAmount) ?? 0;

            var pendingRevenue = await _context.Invoices
                .Where(i => i.Status == InvoiceStatus.Pending)
                .SumAsync(i => (decimal?)i.PatientAmount) ?? 0;

            return new DashboardResponseDto
            {
                TotalPatients = totalPatients,
                TotalDoctors = totalDoctors,
                TotalBeds = totalBeds,
                OccupiedBeds = occupiedBeds,
                AvailableBeds = availableBeds,
                AppointmentsToday = appointmentsToday,
                ActiveAdmissions = activeAdmissions,
                TotalRevenue = totalRevenue,
                PendingRevenue = pendingRevenue
            };
        }
    }
}