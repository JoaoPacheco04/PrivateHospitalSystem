using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly PrivateHospitalDbContext _context;

        public AuditLogService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string action, string entityName, Guid? entityId, Guid? performedByUserId, string? performedByName, string? details = null)
        {
            _context.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                PerformedByUserId = performedByUserId,
                PerformedByName = performedByName,
                Details = details,
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task<List<AuditLogResponseDto>> GetRecentAsync(int count = 50)
        {
            return await _context.AuditLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(count)
                .Select(a => new AuditLogResponseDto
                {
                    Id = a.Id,
                    Action = a.Action,
                    EntityName = a.EntityName,
                    EntityId = a.EntityId,
                    PerformedByName = a.PerformedByName,
                    Details = a.Details,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();
        }
    }
}