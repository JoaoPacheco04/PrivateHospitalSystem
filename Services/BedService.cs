using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class BedService : IBedService
    {
        private readonly PrivateHospitalDbContext _context;

        public BedService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<BedResponseDto>> GetAllAsync()
        {
            return await _context.Beds.Select(b => ToDto(b)).ToListAsync();
        }

        public async Task<List<BedResponseDto>> GetAvailableAsync()
        {
            return await _context.Beds
                .Where(b => b.Status == BedStatus.Available)
                .Select(b => ToDto(b))
                .ToListAsync();
        }

        public async Task<BedResponseDto?> GetByIdAsync(Guid id)
        {
            var bed = await _context.Beds.FindAsync(id);
            return bed == null ? null : ToDto(bed);
        }

        public async Task<BedResponseDto> CreateAsync(CreateBedDto dto)
        {
            var bed = new Bed
            {
                Id = Guid.NewGuid(),
                BedNumber = dto.BedNumber,
                Department = dto.Department
            };

            _context.Beds.Add(bed);
            await _context.SaveChangesAsync();

            return ToDto(bed);
        }

        private static BedResponseDto ToDto(Bed b)
        {
            return new BedResponseDto
            {
                Id = b.Id,
                BedNumber = b.BedNumber,
                Department = b.Department,
                Status = b.Status.ToString(),
                CreatedAt = b.CreatedAt
            };
        }

        public async Task<bool> UpdateAsync(Guid id, CreateBedDto dto)
        {
            var bed = await _context.Beds.FindAsync(id);
            if (bed == null) return false;

            bed.BedNumber = dto.BedNumber;
            bed.Department = dto.Department;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var bed = await _context.Beds.FindAsync(id);
            if (bed == null) return false;

            _context.Beds.Remove(bed);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}