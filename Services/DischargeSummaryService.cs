using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class DischargeSummaryService : IDischargeSummaryService
    {
        private readonly PrivateHospitalDbContext _context;

        public DischargeSummaryService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<DischargeSummaryResponseDto?> GetByAdmissionAsync(Guid admissionId)
        {
            var summary = await _context.DischargeSummaries
                .Include(d => d.Admission).ThenInclude(a => a!.Patient)
                .Include(d => d.IssuedByDoctor)
                .FirstOrDefaultAsync(d => d.AdmissionId == admissionId);

            return summary == null ? null : ToDto(summary);
        }

        public async Task<(DischargeSummaryResponseDto? Result, string? Error)> CreateAsync(CreateDischargeSummaryDto dto)
        {
            var admission = await _context.Admissions
                .Include(a => a.Patient)
                .Include(a => a.Bed)
                .FirstOrDefaultAsync(a => a.Id == dto.AdmissionId);

            if (admission == null)
                return (null, "Admission not found.");

            if (admission.DischargedAt == null)
                return (null, "Patient must be discharged before creating a discharge summary.");

            var summary = new DischargeSummary
            {
                Id = Guid.NewGuid(),
                AdmissionId = dto.AdmissionId,
                Diagnosis = dto.Diagnosis,
                TreatmentSummary = dto.TreatmentSummary,
                MedicationOnDischarge = dto.MedicationOnDischarge,
                FollowUpDate = dto.FollowUpDate,
                IssuedByDoctorId = dto.IssuedByDoctorId
            };

            _context.DischargeSummaries.Add(summary);
            await _context.SaveChangesAsync();

            var created = await _context.DischargeSummaries
                .Include(d => d.Admission).ThenInclude(a => a!.Patient)
                .Include(d => d.IssuedByDoctor)
                .FirstAsync(d => d.Id == summary.Id);

            return (ToDto(created), null);
        }

        private static DischargeSummaryResponseDto ToDto(DischargeSummary d)
        {
            return new DischargeSummaryResponseDto
            {
                Id = d.Id,
                AdmissionId = d.AdmissionId,
                PatientName = d.Admission?.Patient?.FullName ?? string.Empty,
                Diagnosis = d.Diagnosis,
                TreatmentSummary = d.TreatmentSummary,
                MedicationOnDischarge = d.MedicationOnDischarge,
                FollowUpDate = d.FollowUpDate,
                IssuedByDoctorName = d.IssuedByDoctor?.FullName ?? string.Empty,
                CreatedAt = d.CreatedAt
            };
        }
    }
}