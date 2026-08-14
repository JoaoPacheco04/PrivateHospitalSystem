using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class DoctorService : IDoctorService
    {
        private readonly PrivateHospitalDbContext _context;

        public DoctorService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<DoctorResponseDto>> GetAllAsync()
        {
            return await _context.Doctors
                .Include(d => d.Specialties).ThenInclude(ds => ds.Specialty)
                .Select(d => ToDto(d))
                .ToListAsync();
        }

        public async Task<DoctorResponseDto?> GetByIdAsync(Guid id)
        {
            var doctor = await _context.Doctors
                .Include(d => d.Specialties).ThenInclude(ds => ds.Specialty)
                .FirstOrDefaultAsync(d => d.Id == id);

            return doctor == null ? null : ToDto(doctor);
        }

        public async Task<DoctorResponseDto> CreateAsync(CreateDoctorDto dto)
        {
            var doctor = new Doctor
            {
                Id = Guid.NewGuid(),
                FullName = dto.FullName,
                LicenseNumber = dto.LicenseNumber,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email
            };

            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            return ToDto(doctor);
        }

        public async Task<bool> UpdateAsync(Guid id, CreateDoctorDto dto)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return false;

            doctor.FullName = dto.FullName;
            doctor.LicenseNumber = dto.LicenseNumber;
            doctor.PhoneNumber = dto.PhoneNumber;
            doctor.Email = dto.Email;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var doctor = await _context.Doctors.FindAsync(id);
            if (doctor == null) return false;

            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
            return true;
        }

        private static DoctorResponseDto ToDto(Doctor d)
        {
            return new DoctorResponseDto
            {
                Id = d.Id,
                FullName = d.FullName,
                LicenseNumber = d.LicenseNumber,
                PhoneNumber = d.PhoneNumber,
                Email = d.Email,
                IsActive = d.IsActive,
                Specialties = d.Specialties?.Select(s => s.Specialty?.Name ?? string.Empty).ToList() ?? new(),
                CreatedAt = d.CreatedAt
            };
        }
    }
}