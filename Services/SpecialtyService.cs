using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class SpecialtyService : ISpecialtyService
    {
        private readonly PrivateHospitalDbContext _context;

        public SpecialtyService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<SpecialtyResponseDto>> GetAllAsync()
        {
            return await _context.Specialties
                .Select(s => new SpecialtyResponseDto { Id = s.Id, Name = s.Name })
                .ToListAsync();
        }

        public async Task<SpecialtyResponseDto> CreateAsync(CreateSpecialtyDto dto)
        {
            var specialty = new Specialty { Id = Guid.NewGuid(), Name = dto.Name };

            _context.Specialties.Add(specialty);
            await _context.SaveChangesAsync();

            return new SpecialtyResponseDto { Id = specialty.Id, Name = specialty.Name };
        }
    }
}