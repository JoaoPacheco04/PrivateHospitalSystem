using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IInsuranceProviderService
    {
        Task<List<InsuranceProviderResponseDto>> GetAllAsync();
        Task<InsuranceProviderResponseDto?> GetByIdAsync(Guid id);
        Task<InsuranceProviderResponseDto> CreateAsync(CreateInsuranceProviderDto dto);
        Task<bool> UpdateAsync(Guid id, CreateInsuranceProviderDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}