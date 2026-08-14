using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IPatientService
    {
        Task<List<PatientResponseDto>> GetAllAsync();
        Task<PatientResponseDto?> GetByIdAsync(Guid id);
        Task<PatientResponseDto> CreateAsync(CreatePatientDto dto);
        Task<bool> UpdateAsync(Guid id, CreatePatientDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}