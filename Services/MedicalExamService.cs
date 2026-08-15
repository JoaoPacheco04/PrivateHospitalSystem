using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class MedicalExamService : IMedicalExamService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly IInvoiceService _invoiceService;

        public MedicalExamService(PrivateHospitalDbContext context, IInvoiceService invoiceService)
        {
            _context = context;
            _invoiceService = invoiceService;
        }

        public async Task<List<MedicalExamResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.MedicalExams
                .Include(e => e.Patient)
                .Include(e => e.Doctor)
                .Where(e => e.PatientId == patientId)
                .Select(e => ToDto(e))
                .ToListAsync();
        }

        public async Task<MedicalExamResponseDto> CreateAsync(CreateMedicalExamDto dto)
        {
            var exam = new MedicalExam
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                ExamType = dto.ExamType,
                Status = ExamStatus.Requested,
                RequestedAt = DateTime.UtcNow
            };

            _context.MedicalExams.Add(exam);
            await _context.SaveChangesAsync();

            var created = await _context.MedicalExams
                .Include(e => e.Patient)
                .Include(e => e.Doctor)
                .FirstAsync(e => e.Id == exam.Id);

            await _invoiceService.CreateAsync(new CreateInvoiceDto
            {
                PatientId = dto.PatientId,
                ProcedureType = dto.ExamType
            });

            return ToDto(created);
        }

        public async Task<bool> CompleteAsync(Guid id, string result)
        {
            var exam = await _context.MedicalExams.FindAsync(id);
            if (exam == null) return false;

            exam.Result = result;
            exam.Status = ExamStatus.Completed;
            exam.CompletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private static MedicalExamResponseDto ToDto(MedicalExam e)
        {
            return new MedicalExamResponseDto
            {
                Id = e.Id,
                PatientId = e.PatientId,
                PatientName = e.Patient?.FullName ?? string.Empty,
                DoctorId = e.DoctorId,
                DoctorName = e.Doctor?.FullName ?? string.Empty,
                ExamType = e.ExamType,
                Status = e.Status.ToString(),
                Result = e.Result,
                RequestedAt = e.RequestedAt,
                CompletedAt = e.CompletedAt
            };
        }
    }
}