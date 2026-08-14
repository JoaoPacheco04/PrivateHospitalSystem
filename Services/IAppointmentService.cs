using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IAppointmentService
    {
        Task<List<AppointmentResponseDto>> GetAllAsync();
        Task<AppointmentResponseDto?> GetByIdAsync(Guid id);
        Task<(AppointmentResponseDto? Result, string? Error)> CreateAsync(CreateAppointmentDto dto);
        Task<bool> CancelAsync(Guid id);
    }
}