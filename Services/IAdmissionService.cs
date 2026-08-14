using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IAdmissionService
    {
        Task<List<AdmissionResponseDto>> GetActiveAsync();
        Task<(AdmissionResponseDto? Result, string? Error)> CreateAsync(CreateAdmissionDto dto);
        Task<bool> DischargeAsync(Guid id);
    }
}