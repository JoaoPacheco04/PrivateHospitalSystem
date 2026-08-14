using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IDoctorService
    {
        Task<List<DoctorResponseDto>> GetAllAsync();
        Task<DoctorResponseDto?> GetByIdAsync(Guid id);
        Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto);
        Task<bool> UpdateAsync(Guid id, CreateDoctorDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}