using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class InformedConsentService : IInformedConsentService
    {
        private readonly PrivateHospitalDbContext _context;

        public InformedConsentService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<InformedConsentResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.InformedConsents
                .Include(c => c.Patient)
                .Include(c => c.WitnessedByDoctor)
                .Where(c => c.PatientId == patientId)
                .Select(c => ToDto(c))
                .ToListAsync();
        }

        public async Task<InformedConsentResponseDto> CreateAsync(CreateInformedConsentDto dto)
        {
            var consent = new InformedConsent
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                SurgeryId = dto.SurgeryId,
                ProcedureDescription = dto.ProcedureDescription,
                RisksExplained = dto.RisksExplained,
                WitnessedByDoctorId = dto.WitnessedByDoctorId,
                PatientSigned = false
            };

            _context.InformedConsents.Add(consent);
            await _context.SaveChangesAsync();

            var created = await _context.InformedConsents
                .Include(c => c.Patient)
                .Include(c => c.WitnessedByDoctor)
                .FirstAsync(c => c.Id == consent.Id);

            return ToDto(created);
        }

        public async Task<bool> SignAsync(Guid id)
        {
            var consent = await _context.InformedConsents.FindAsync(id);
            if (consent == null) return false;

            consent.PatientSigned = true;
            consent.SignedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private static InformedConsentResponseDto ToDto(InformedConsent c)
        {
            return new InformedConsentResponseDto
            {
                Id = c.Id,
                PatientId = c.PatientId,
                PatientName = c.Patient?.FullName ?? string.Empty,
                SurgeryId = c.SurgeryId,
                ProcedureDescription = c.ProcedureDescription,
                RisksExplained = c.RisksExplained,
                PatientSigned = c.PatientSigned,
                SignedAt = c.SignedAt,
                WitnessedByDoctorName = c.WitnessedByDoctor?.FullName ?? string.Empty,
                CreatedAt = c.CreatedAt
            };
        }
    }
}