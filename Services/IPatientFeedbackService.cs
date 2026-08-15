using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IPatientFeedbackService
    {
        Task<List<PatientFeedbackResponseDto>> GetAllAsync();
        Task<double> GetAverageRatingAsync();
        Task<PatientFeedbackResponseDto> CreateAsync(CreatePatientFeedbackDto dto);
    }
}