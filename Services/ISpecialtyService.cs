using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface ISpecialtyService
    {
        Task<List<SpecialtyResponseDto>> GetAllAsync();
        Task<SpecialtyResponseDto> CreateAsync(CreateSpecialtyDto dto);
    }
}