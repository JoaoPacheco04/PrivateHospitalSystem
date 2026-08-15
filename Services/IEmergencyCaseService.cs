using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IEmergencyCaseService
    {
        Task<List<EmergencyCaseResponseDto>> GetQueueAsync();
        Task<EmergencyCaseResponseDto> CreateAsync(CreateEmergencyCaseDto dto);
        Task<bool> StartAsync(Guid id, Guid doctorId);
        Task<(bool Success, string? Error)> CompleteAsync(Guid id, CompleteEmergencyCaseDto dto);
    }
}