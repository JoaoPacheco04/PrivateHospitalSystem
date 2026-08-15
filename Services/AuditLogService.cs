using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;
using System.Security.Claims;

namespace PrivateHospitalSystem.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(PrivateHospitalDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(string action, string entityName, Guid? entityId, Guid? performedByUserId, string? performedByName, string? details = null)
        {
            var user = _httpContextAccessor.HttpContext?.User;

            Guid? userId = performedByUserId;
            string? userName = performedByName;

            if (user?.Identity?.IsAuthenticated == true)
            {
                var subClaim = user.FindFirst("sub")?.Value;
                if (userId == null && subClaim != null && Guid.TryParse(subClaim, out var parsedId))
                    userId = parsedId;

                userName ??= user.FindFirst("fullName")?.Value;
            }

            _context.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                PerformedByUserId = userId,
                PerformedByName = userName,
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