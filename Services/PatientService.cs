using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class PatientService : IPatientService
    {
        private readonly PrivateHospitalDbContext _context;

        public PatientService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<PatientResponseDto>> GetAllAsync()
        {
            return await _context.Patients
                .Include(p => p.InsuranceProvider)
                .Select(p => ToDto(p))
                .ToListAsync();
        }

        public async Task<PatientResponseDto?> GetByIdAsync(Guid id)
        {
            var patient = await _context.Patients
                .Include(p => p.InsuranceProvider)
                .FirstOrDefaultAsync(p => p.Id == id);

            return patient == null ? null : ToDto(patient);
        }

        public async Task<PatientResponseDto> CreateAsync(CreatePatientDto dto)
        {
            var count = await _context.Patients.CountAsync();

            var patient = new Patient
            {
                Id = Guid.NewGuid(),
                PatientNumber = $"P-{(count + 1):D5}",
                FullName = dto.FullName,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                Address = dto.Address,
                NIF = dto.NIF,
                HealthNumber = dto.HealthNumber,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone,
                Allergies = dto.Allergies,
                MedicalNotes = dto.MedicalNotes,
                InsuranceProviderId = dto.InsuranceProviderId,
                PolicyNumber = dto.PolicyNumber
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            var created = await GetByIdAsync(patient.Id);
            return created!;
        }

        public async Task<bool> UpdateAsync(Guid id, CreatePatientDto dto)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return false;

            patient.FullName = dto.FullName;
            patient.DateOfBirth = dto.DateOfBirth;
            patient.Gender = dto.Gender;
            patient.PhoneNumber = dto.PhoneNumber;
            patient.Email = dto.Email;
            patient.Address = dto.Address;
            patient.NIF = dto.NIF;
            patient.HealthNumber = dto.HealthNumber;
            patient.EmergencyContactName = dto.EmergencyContactName;
            patient.EmergencyContactPhone = dto.EmergencyContactPhone;
            patient.Allergies = dto.Allergies;
            patient.MedicalNotes = dto.MedicalNotes;
            patient.InsuranceProviderId = dto.InsuranceProviderId;
            patient.PolicyNumber = dto.PolicyNumber;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var patient = await _context.Patients.FindAsync(id);
            if (patient == null) return false;

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
            return true;
        }

        private static PatientResponseDto ToDto(Patient p)
        {
            return new PatientResponseDto
            {
                Id = p.Id,
                PatientNumber = p.PatientNumber,
                FullName = p.FullName,
                DateOfBirth = p.DateOfBirth,
                Gender = p.Gender,
                PhoneNumber = p.PhoneNumber,
                Email = p.Email,
                Address = p.Address,
                NIF = p.NIF,
                HealthNumber = p.HealthNumber,
                EmergencyContactName = p.EmergencyContactName,
                EmergencyContactPhone = p.EmergencyContactPhone,
                Allergies = p.Allergies,
                MedicalNotes = p.MedicalNotes,
                InsuranceProviderId = p.InsuranceProviderId,
                InsuranceProviderName = p.InsuranceProvider?.Name,
                PolicyNumber = p.PolicyNumber,
                CreatedAt = p.CreatedAt
            };
        }

        public async Task<PagedResultDto<PatientResponseDto>> GetPagedAsync(int page, int pageSize)
        {
            var query = _context.Patients.Include(p => p.InsuranceProvider);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.FullName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => ToDto(p))
                .ToListAsync();

            return new PagedResultDto<PatientResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}