using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IDashboardService
    {
        Task<DashboardResponseDto> GetSummaryAsync();
    }
}