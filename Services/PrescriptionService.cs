using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly IInvoiceService _invoiceService;

        public PrescriptionService(PrivateHospitalDbContext context, IInvoiceService invoiceService)
        {
            _context = context;
            _invoiceService = invoiceService;
        }

        public async Task<List<PrescriptionResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .Where(p => p.PatientId == patientId)
                .Select(p => ToDto(p))
                .ToListAsync();
        }

        public async Task<(PrescriptionResponseDto? Result, string? Error)> CreateAsync(CreatePrescriptionDto dto)
        {
            var medication = await _context.Medications
                .FirstOrDefaultAsync(m => m.Name == dto.MedicationName);

            if (medication != null)
            {
                if (medication.StockQuantity <= 0)
                    return (null, $"No stock available for {dto.MedicationName}.");

                medication.StockQuantity -= 1;
            }

            var prescription = new Prescription
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                MedicationName = dto.MedicationName,
                Dosage = dto.Dosage,
                Instructions = dto.Instructions,
                PrescribedAt = DateTime.UtcNow
            };

            _context.Prescriptions.Add(prescription);
            await _context.SaveChangesAsync();

            var created = await _context.Prescriptions
                .Include(p => p.Patient)
                .Include(p => p.Doctor)
                .FirstAsync(p => p.Id == prescription.Id);

            await _invoiceService.CreateAsync(new CreateInvoiceDto
            {
                PatientId = dto.PatientId,
                ProcedureType = dto.MedicationName
            });

            return (ToDto(created), null);
        }

        private static PrescriptionResponseDto ToDto(Prescription p)
        {
            return new PrescriptionResponseDto
            {
                Id = p.Id,
                PatientId = p.PatientId,
                PatientName = p.Patient?.FullName ?? string.Empty,
                DoctorId = p.DoctorId,
                DoctorName = p.Doctor?.FullName ?? string.Empty,
                AppointmentId = p.AppointmentId,
                MedicationName = p.MedicationName,
                Dosage = p.Dosage,
                Instructions = p.Instructions,
                PrescribedAt = p.PrescribedAt
            };
        }
    }
}