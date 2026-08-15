using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly IAuditLogService _auditLogService;

        public AppointmentService(PrivateHospitalDbContext context, IAuditLogService auditLogService)
        {
            _context = context;
            _auditLogService = auditLogService;
        }

        public async Task<List<AppointmentResponseDto>> GetAllAsync()
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Room)
                .Select(a => ToDto(a))
                .ToListAsync();
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(Guid id)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .Include(a => a.Room)
                .FirstOrDefaultAsync(a => a.Id == id);

            return appointment == null ? null : ToDto(appointment);
        }

        public async Task<(AppointmentResponseDto? Result, string? Error)> CreateAsync(CreateAppointmentDto dto)
        {
            var endTime = dto.ScheduledAt.AddMinutes(dto.DurationMinutes);

            bool doctorBusy = await _context.Appointments.AnyAsync(a =>
                a.DoctorId == dto.DoctorId &&
                a.Status != AppointmentStatus.Cancelled &&
                a.ScheduledAt < endTime &&
                a.ScheduledAt.AddMinutes(a.DurationMinutes) > dto.ScheduledAt);

            if (doctorBusy)
                return (null, "Doctor already has an appointment in this time slot.");

            bool roomBusy = await _context.Appointments.AnyAsync(a =>
                a.RoomId == dto.RoomId &&
                a.Status != AppointmentStatus.Cancelled &&
                a.ScheduledAt < endTime &&
                a.ScheduledAt.AddMinutes(a.DurationMinutes) > dto.ScheduledAt);

            if (roomBusy)
                return (null, "Room already booked in this time slot.");

            var appointment = new Appointment
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                RoomId = dto.RoomId,
                ScheduledAt = dto.ScheduledAt,
                DurationMinutes = dto.DurationMinutes,
                Notes = dto.Notes,
                Status = AppointmentStatus.Scheduled
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            var created = await GetByIdAsync(appointment.Id);
            return (created, null);
        }

        public async Task<bool> CancelAsync(Guid id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            appointment.Status = AppointmentStatus.Cancelled;
            await _context.SaveChangesAsync();

            await _auditLogService.LogAsync("AppointmentCancelled", "Appointment", appointment.Id, null, null, null);

            return true;
        }

        public async Task<bool> UpdateAsync(Guid id, CreateAppointmentDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            var endTime = dto.ScheduledAt.AddMinutes(dto.DurationMinutes);

            bool doctorBusy = await _context.Appointments.AnyAsync(a =>
                a.Id != id &&
                a.DoctorId == dto.DoctorId &&
                a.Status != AppointmentStatus.Cancelled &&
                a.ScheduledAt < endTime &&
                a.ScheduledAt.AddMinutes(a.DurationMinutes) > dto.ScheduledAt);

            if (doctorBusy) return false;

            appointment.PatientId = dto.PatientId;
            appointment.DoctorId = dto.DoctorId;
            appointment.RoomId = dto.RoomId;
            appointment.ScheduledAt = dto.ScheduledAt;
            appointment.DurationMinutes = dto.DurationMinutes;
            appointment.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment == null) return false;

            _context.Appointments.Remove(appointment);
            await _context.SaveChangesAsync();
            return true;
        }

        private static AppointmentResponseDto ToDto(Appointment a)
        {
            return new AppointmentResponseDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = a.Patient?.FullName ?? string.Empty,
                DoctorId = a.DoctorId,
                DoctorName = a.Doctor?.FullName ?? string.Empty,
                RoomId = a.RoomId,
                RoomNumber = a.Room?.RoomNumber ?? string.Empty,
                ScheduledAt = a.ScheduledAt,
                DurationMinutes = a.DurationMinutes,
                Status = a.Status.ToString(),
                Notes = a.Notes
            };
        }
    }
}