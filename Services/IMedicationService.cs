using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IMedicationService
    {
        Task<List<MedicationResponseDto>> GetAllAsync();
        Task<MedicationResponseDto> CreateAsync(CreateMedicationDto dto);
        Task<bool> RestockAsync(Guid id, int quantity);
    }
}