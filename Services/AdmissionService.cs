using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class AdmissionService : IAdmissionService
    {
        private readonly PrivateHospitalDbContext _context;

        public AdmissionService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdmissionResponseDto>> GetActiveAsync()
        {
            return await _context.Admissions
                .Include(a => a.Patient)
                .Include(a => a.Bed)
                .Where(a => a.DischargedAt == null)
                .Select(a => ToDto(a))
                .ToListAsync();
        }

        public async Task<(AdmissionResponseDto? Result, string? Error)> CreateAsync(CreateAdmissionDto dto)
        {
            var bed = await _context.Beds.FindAsync(dto.BedId);
            if (bed == null || bed.Status != BedStatus.Available)
                return (null, "Bed is not available.");

            var admission = new Admission
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                BedId = dto.BedId,
                Reason = dto.Reason,
                AdmittedAt = DateTime.UtcNow
            };

            bed.Status = BedStatus.Occupied;

            _context.Admissions.Add(admission);
            await _context.SaveChangesAsync();

            var created = await _context.Admissions
                .Include(a => a.Patient)
                .Include(a => a.Bed)
                .FirstAsync(a => a.Id == admission.Id);

            return (ToDto(created), null);
        }

        public async Task<bool> DischargeAsync(Guid id)
        {
            var admission = await _context.Admissions.FindAsync(id);
            if (admission == null) return false;

            admission.DischargedAt = DateTime.UtcNow;

            var bed = await _context.Beds.FindAsync(admission.BedId);
            if (bed != null) bed.Status = BedStatus.Available;

            await _context.SaveChangesAsync();
            return true;
        }

        private static AdmissionResponseDto ToDto(Admission a)
        {
            return new AdmissionResponseDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = a.Patient?.FullName ?? string.Empty,
                BedId = a.BedId,
                BedNumber = a.Bed?.BedNumber ?? string.Empty,
                AdmittedAt = a.AdmittedAt,
                DischargedAt = a.DischargedAt,
                Reason = a.Reason
            };
        }
    }
}