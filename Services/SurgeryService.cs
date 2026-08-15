using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class SurgeryService : ISurgeryService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly IInvoiceService _invoiceService;

        public SurgeryService(PrivateHospitalDbContext context, IInvoiceService invoiceService)
        {
            _context = context;
            _invoiceService = invoiceService;
        }

        public async Task<List<SurgeryResponseDto>> GetAllAsync()
        {
            return await _context.Surgeries
                .Include(s => s.Patient)
                .Include(s => s.Room)
                .Include(s => s.Team).ThenInclude(t => t.Doctor)
                .Select(s => ToDto(s))
                .ToListAsync();
        }

        public async Task<SurgeryResponseDto?> GetByIdAsync(Guid id)
        {
            var surgery = await _context.Surgeries
                .Include(s => s.Patient)
                .Include(s => s.Room)
                .Include(s => s.Team).ThenInclude(t => t.Doctor)
                .FirstOrDefaultAsync(s => s.Id == id);

            return surgery == null ? null : ToDto(surgery);
        }

        public async Task<(SurgeryResponseDto? Result, string? Error)> CreateAsync(CreateSurgeryDto dto)
        {
            var endTime = dto.ScheduledAt.AddMinutes(dto.DurationMinutes);

            bool roomBusy = await _context.Surgeries.AnyAsync(s =>
                s.RoomId == dto.RoomId &&
                s.Status != SurgeryStatus.Cancelled &&
                s.ScheduledAt < endTime &&
                s.ScheduledAt.AddMinutes(s.DurationMinutes) > dto.ScheduledAt);

            if (roomBusy)
                return (null, "Room already booked for surgery in this time slot.");

            var surgery = new Surgery
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                RoomId = dto.RoomId,
                ProcedureName = dto.ProcedureName,
                ScheduledAt = dto.ScheduledAt,
                DurationMinutes = dto.DurationMinutes,
                Notes = dto.Notes,
                Status = SurgeryStatus.Scheduled
            };

            _context.Surgeries.Add(surgery);
            await _context.SaveChangesAsync();

            // Gera fatura automaticamente, se houver preço configurado para este procedimento
            await _invoiceService.CreateAsync(new CreateInvoiceDto
            {
                PatientId = dto.PatientId,
                ProcedureType = dto.ProcedureName
            });

            var created = await GetByIdAsync(surgery.Id);
            return (created, null);
        }

        public async Task<bool> AddTeamMemberAsync(Guid surgeryId, AddSurgeryTeamMemberDto dto)
        {
            var surgery = await _context.Surgeries.FindAsync(surgeryId);
            if (surgery == null) return false;

            _context.SurgeryTeamMembers.Add(new SurgeryTeamMember
            {
                Id = Guid.NewGuid(),
                SurgeryId = surgeryId,
                DoctorId = dto.DoctorId,
                Role = dto.Role
            });

            await _context.SaveChangesAsync();
            return true;
        }

        private static SurgeryResponseDto ToDto(Surgery s)
        {
            return new SurgeryResponseDto
            {
                Id = s.Id,
                PatientId = s.PatientId,
                PatientName = s.Patient?.FullName ?? string.Empty,
                RoomId = s.RoomId,
                RoomNumber = s.Room?.RoomNumber ?? string.Empty,
                ProcedureName = s.ProcedureName,
                ScheduledAt = s.ScheduledAt,
                DurationMinutes = s.DurationMinutes,
                Status = s.Status.ToString(),
                Notes = s.Notes,
                Team = s.Team?.Select(t => $"{t.Doctor?.FullName} ({t.Role})").ToList() ?? new()
            };
        }
    }
}