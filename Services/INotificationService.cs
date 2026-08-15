using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface INotificationService
    {
        Task<List<NotificationResponseDto>> GetByPatientAsync(Guid patientId);
        Task<NotificationResponseDto> CreateAsync(CreateNotificationDto dto);
        Task<bool> MarkAsReadAsync(Guid id);
    }
}