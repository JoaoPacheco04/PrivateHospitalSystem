using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IPrescriptionService
    {
        Task<List<PrescriptionResponseDto>> GetByPatientAsync(Guid patientId);
        Task<(PrescriptionResponseDto? Result, string? Error)> CreateAsync(CreatePrescriptionDto dto);
    }
}