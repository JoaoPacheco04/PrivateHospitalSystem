using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IMedicalExamService
    {
        Task<List<MedicalExamResponseDto>> GetByPatientAsync(Guid patientId);
        Task<MedicalExamResponseDto> CreateAsync(CreateMedicalExamDto dto);
        Task<bool> CompleteAsync(Guid id, string result);
    }
}