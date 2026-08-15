using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class ReferralService : IReferralService
    {
        private readonly PrivateHospitalDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmergencyCaseService _emergencyCaseService;

        public ReferralService(PrivateHospitalDbContext context, INotificationService notificationService, IEmergencyCaseService emergencyCaseService)
        {
            _context = context;
            _notificationService = notificationService;
            _emergencyCaseService = emergencyCaseService;
        }

        public async Task<List<ReferralResponseDto>> GetByPatientAsync(Guid patientId)
        {
            return await _context.Referrals
                .Include(r => r.Patient)
                .Include(r => r.ReferringDoctor)
                .Include(r => r.ReferredToDoctor)
                .Where(r => r.PatientId == patientId)
                .Select(r => ToDto(r))
                .ToListAsync();
        }

        public async Task<List<ReferralResponseDto>> GetByDoctorAsync(Guid doctorId)
        {
            return await _context.Referrals
                .Include(r => r.Patient)
                .Include(r => r.ReferringDoctor)
                .Include(r => r.ReferredToDoctor)
                .Where(r => r.ReferredToDoctorId == doctorId)
                .Select(r => ToDto(r))
                .ToListAsync();
        }

        public async Task<ReferralResponseDto> CreateAsync(CreateReferralDto dto)
        {
            var referral = new Referral
            {
                Id = Guid.NewGuid(),
                PatientId = dto.PatientId,
                ReferringDoctorId = dto.ReferringDoctorId,
                ReferredToDoctorId = dto.ReferredToDoctorId,
                Reason = dto.Reason,
                Notes = dto.Notes,
                IsUrgent = dto.IsUrgent,
                Status = ReferralStatus.Pending
            };

            _context.Referrals.Add(referral);
            await _context.SaveChangesAsync();

            var created = await _context.Referrals
                .Include(r => r.Patient)
                .Include(r => r.ReferringDoctor)
                .Include(r => r.ReferredToDoctor)
                .FirstAsync(r => r.Id == referral.Id);

            await _notificationService.CreateAsync(new CreateNotificationDto
            {
                DoctorId = referral.ReferredToDoctorId,
                Message = $"New referral received for patient {created.Patient?.FullName} — reason: {referral.Reason}"
            });

            return ToDto(created);
        }

        public async Task<bool> UpdateStatusAsync(Guid id, ReferralStatusUpdateDto dto)
        {
            var referral = await _context.Referrals
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (referral == null) return false;

            if (!Enum.TryParse<ReferralStatus>(dto.Status, out var newStatus))
                return false;

            referral.Status = newStatus;
            await _context.SaveChangesAsync();

            if (newStatus == ReferralStatus.Accepted && referral.IsUrgent)
            {
                await _emergencyCaseService.CreateAsync(new CreateEmergencyCaseDto
                {
                    PatientId = referral.PatientId,
                    Complaint = $"Urgent referral: {referral.Reason}",
                    Priority = 4 // VeryUrgent
                });
            }

            return true;
        }

        private static ReferralResponseDto ToDto(Referral r)
        {
            return new ReferralResponseDto
            {
                Id = r.Id,
                PatientId = r.PatientId,
                PatientName = r.Patient?.FullName ?? string.Empty,
                ReferringDoctorId = r.ReferringDoctorId,
                ReferringDoctorName = r.ReferringDoctor?.FullName ?? string.Empty,
                ReferredToDoctorId = r.ReferredToDoctorId,
                ReferredToDoctorName = r.ReferredToDoctor?.FullName ?? string.Empty,
                Reason = r.Reason,
                Notes = r.Notes,
                IsUrgent = r.IsUrgent,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt
            };
        }
    }
}