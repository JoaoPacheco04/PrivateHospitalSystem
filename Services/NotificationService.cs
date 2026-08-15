using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class NotificationService : INotificationService
    {
        private readonly PrivateHospitalDbContext _context;

        public NotificationService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<NotificationResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.Notifications
                .Where(n => n.PatientId == patientId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToDto(n))
                .ToListAsync();
        }

        public async Task<List<NotificationResponseDto>> GetByDoctorAsync(Guid doctorId)
        {
            return await _context.Notifications
                .Where(n => n.DoctorId == doctorId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => ToDto(n))
                .ToListAsync();
        }

        public async Task<NotificationResponseDto> CreateAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                Message = dto.Message
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return ToDto(notification);
        }

        public async Task<bool> MarkAsReadAsync(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return true;
        }

        private static NotificationResponseDto ToDto(Notification n)
        {
            return new NotificationResponseDto
            {
                Id = n.Id,
                PatientId = n.PatientId,
                DoctorId = n.DoctorId,
                Message = n.Message,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt
            };
        }
    }
}