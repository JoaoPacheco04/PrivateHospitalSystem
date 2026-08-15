using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IDischargeSummaryService
    {
        Task<DischargeSummaryResponseDto?> GetByAdmissionAsync(Guid admissionId);
        Task<(DischargeSummaryResponseDto? Result, string? Error)> CreateAsync(CreateDischargeSummaryDto dto);
    }
}