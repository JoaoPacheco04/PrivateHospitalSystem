namespace PrivateHospitalSystem.Services
{
    public interface IAuditLogService
    {
        Task LogAsync(string action, string entityName, Guid? entityId, Guid? performedByUserId, string? performedByName, string? details = null);
        Task<List<PrivateHospitalSystem.DTOs.AuditLogResponseDto>> GetRecentAsync(int count = 50);
    }
}