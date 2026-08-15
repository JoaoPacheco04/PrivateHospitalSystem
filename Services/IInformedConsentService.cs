using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IInformedConsentService
    {
        Task<List<InformedConsentResponseDto>> GetByPatientAsync(Guid patientId);
        Task<InformedConsentResponseDto> CreateAsync(CreateInformedConsentDto dto);
        Task<bool> SignAsync(Guid id);
    }
}