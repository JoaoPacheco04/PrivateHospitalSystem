using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface ISurgeryService
    {
        Task<List<SurgeryResponseDto>> GetAllAsync();
        Task<SurgeryResponseDto?> GetByIdAsync(Guid id);
        Task<(SurgeryResponseDto? Result, string? Error)> CreateAsync(CreateSurgeryDto dto);
        Task<bool> AddTeamMemberAsync(Guid surgeryId, AddSurgeryTeamMemberDto dto);
    }
}