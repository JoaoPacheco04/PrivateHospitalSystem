using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IInsuranceCoverageService
    {
        Task<List<InsuranceCoverageResponseDto>> GetAllAsync();
        Task<InsuranceCoverageResponseDto?> GetByIdAsync(Guid id);
        Task<InsuranceCoverageResponseDto> CreateAsync(CreateInsuranceCoverageDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}