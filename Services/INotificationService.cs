using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface INotificationService
    {
        Task<List<NotificationResponseDto>> GetByPatientAsync(Guid patientId);
        Task<List<NotificationResponseDto>> GetByDoctorAsync(Guid doctorId);
        Task<List<NotificationResponseDto>> GetAdminNotificationsAsync();
        Task<NotificationResponseDto> CreateAsync(CreateNotificationDto dto);
        Task<bool> MarkAsReadAsync(Guid id);
    }
}