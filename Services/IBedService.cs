using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IBedService
    {
        Task<List<BedResponseDto>> GetAllAsync();
        Task<List<BedResponseDto>> GetAvailableAsync();
        Task<BedResponseDto?> GetByIdAsync(Guid id);
        Task<BedResponseDto> CreateAsync(CreateBedDto dto);
        Task<bool> UpdateAsync(Guid id, CreateBedDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}