using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly PrivateHospitalDbContext _context;

        public InvoiceService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        // Returns invoices for a specific patient (used by /me endpoint)
        public async Task<List<InvoiceResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.Invoices
                .Include(i => i.Patient)
                .Where(i => i.PatientId == patientId)
                .Select(i => ToDto(i))
                .ToListAsync();
        }

        public async Task<(InvoiceResponseDto? Result, string? Error)> CreateAsync(CreateInvoiceDto dto)
        {
            var patient = await _context.Patients
                .Include(p => p.InsuranceProvider)
                .FirstOrDefaultAsync(p => p.Id == dto.PatientId);

            if (patient == null)
                return (null, "Patient not found.");

            var procedurePrice = await _context.ProcedurePrices
                .FirstOrDefaultAsync(p => p.ProcedureType == dto.ProcedureType);

            if (procedurePrice == null)
                return (null, "No price configured for this procedure type.");

            decimal totalAmount = procedurePrice.Price;
            decimal insuranceCovered = 0;

            if (patient.InsuranceProviderId != null)
            {
                var coverage = await _context.InsuranceCoverages
                    .FirstOrDefaultAsync(c =>
                        c.InsuranceProviderId == patient.InsuranceProviderId &&
                        c.ProcedureType == dto.ProcedureType);

                if (coverage != null)
                {
                    insuranceCovered = totalAmount * (coverage.CoveragePercentage / 100);
                }
            }

            decimal patientAmount = totalAmount - insuranceCovered;

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                ProcedureType = dto.ProcedureType,
                TotalAmount = totalAmount,
                InsuranceCoveredAmount = insuranceCovered,
                PatientAmount = patientAmount,
                Status = InvoiceStatus.Pending,
                IssuedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            var created = await _context.Invoices
                .Include(i => i.Patient)
                .FirstAsync(i => i.Id == invoice.Id);

            return (ToDto(created), null);
        }

        public async Task<bool> MarkAsPaidAsync(Guid id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null) return false;

            invoice.Status = InvoiceStatus.Paid;
            invoice.PaidAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private static InvoiceResponseDto ToDto(Invoice i)
        {
            return new InvoiceResponseDto
            {
                Id = i.Id,
                PatientId = i.PatientId,
                PatientName = i.Patient?.FullName ?? string.Empty,
                ProcedureType = i.ProcedureType,
                TotalAmount = i.TotalAmount,
                InsuranceCoveredAmount = i.InsuranceCoveredAmount,
                PatientAmount = i.PatientAmount,
                Status = i.Status.ToString(),
                IssuedAt = i.IssuedAt,
                PaidAt = i.PaidAt
            };
        }
    }
}