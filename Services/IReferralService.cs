using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IReferralService
    {
        Task<List<ReferralResponseDto>> GetByPatientAsync(Guid patientId);
        Task<List<ReferralResponseDto>> GetByDoctorAsync(Guid doctorId); 
        Task<ReferralResponseDto> CreateAsync(CreateReferralDto dto);
        Task<bool> UpdateStatusAsync(Guid id, ReferralStatusUpdateDto dto);
    }
}