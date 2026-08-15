using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class PatientFeedbackService : IPatientFeedbackService
    {
        private readonly PrivateHospitalDbContext _context;

        public PatientFeedbackService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<PatientFeedbackResponseDto>> GetAllAsync()
        {
            return await _context.PatientFeedbacks
                .Include(f => f.Patient)
                .OrderByDescending(f => f.CreatedAt)
                .Select(f => ToDto(f))
                .ToListAsync();
        }

        public async Task<double> GetAverageRatingAsync()
        {
            var hasAny = await _context.PatientFeedbacks.AnyAsync();
            if (!hasAny) return 0;

            return await _context.PatientFeedbacks.AverageAsync(f => f.Rating);
        }

        public async Task<PatientFeedbackResponseDto> CreateAsync(CreatePatientFeedbackDto dto)
        {
            var feedback = new PatientFeedback
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                AppointmentId = dto.AppointmentId,
                AdmissionId = dto.AdmissionId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.PatientFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            var created = await _context.PatientFeedbacks
                .Include(f => f.Patient)
                .FirstAsync(f => f.Id == feedback.Id);

            return ToDto(created);
        }

        private static PatientFeedbackResponseDto ToDto(PatientFeedback f)
        {
            return new PatientFeedbackResponseDto
            {
                Id = f.Id,
                PatientId = f.PatientId,
                PatientName = f.Patient?.FullName ?? string.Empty,
                AppointmentId = f.AppointmentId,
                AdmissionId = f.AdmissionId,
                Rating = f.Rating,
                Comment = f.Comment,
                CreatedAt = f.CreatedAt
            };
        }
    }
}