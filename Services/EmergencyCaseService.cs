using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class EmergencyCaseService : IEmergencyCaseService
    {
        private readonly PrivateHospitalDbContext _context;

        public EmergencyCaseService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<EmergencyCaseResponseDto>> GetQueueAsync()
        {
            return await _context.EmergencyCases
                .Include(e => e.Patient)
                .Include(e => e.Doctor)
                .Where(e => e.Status != EmergencyStatus.Completed)
                .OrderByDescending(e => e.Priority) 
                .ThenBy(e => e.ArrivedAt) 
                .Select(e => ToDto(e))
                .ToListAsync();
        }

        public async Task<EmergencyCaseResponseDto> CreateAsync(CreateEmergencyCaseDto dto)
        {
            var emergencyCase = new EmergencyCase
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                Complaint = dto.Complaint,
                Priority = (TriagePriority)dto.Priority,
                Status = EmergencyStatus.Waiting,
                ArrivedAt = DateTime.UtcNow
            };

            _context.EmergencyCases.Add(emergencyCase);
            await _context.SaveChangesAsync();

            var created = await _context.EmergencyCases
                .Include(e => e.Patient)
                .FirstAsync(e => e.Id == emergencyCase.Id);

            return ToDto(created);
        }

        public async Task<bool> StartAsync(Guid id, Guid doctorId)
        {
            var emergencyCase = await _context.EmergencyCases.FindAsync(id);
            if (emergencyCase == null) return false;

            emergencyCase.DoctorId = doctorId;
            emergencyCase.Status = EmergencyStatus.InProgress;
            emergencyCase.StartedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CompleteAsync(Guid id)
        {
            var emergencyCase = await _context.EmergencyCases.FindAsync(id);
            if (emergencyCase == null) return false;

            emergencyCase.Status = EmergencyStatus.Completed;
            emergencyCase.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private static EmergencyCaseResponseDto ToDto(EmergencyCase e)
        {
            return new EmergencyCaseResponseDto
            {
                Id = e.Id,
                PatientId = e.PatientId,
                PatientName = e.Patient?.FullName ?? string.Empty,
                DoctorId = e.DoctorId,
                DoctorName = e.Doctor?.FullName,
                Complaint = e.Complaint,
                Priority = e.Priority.ToString(),
                Status = e.Status.ToString(),
                ArrivedAt = e.ArrivedAt,
                StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt
            };
        }
    }
}