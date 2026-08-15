using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class MedicationService : IMedicationService
    {
        private readonly PrivateHospitalDbContext _context;

        public MedicationService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<MedicationResponseDto>> GetAllAsync()
        {
            return await _context.Medications.Select(m => ToDto(m)).ToListAsync();
        }

        public async Task<MedicationResponseDto> CreateAsync(CreateMedicationDto dto)
        {
            var medication = new Medication
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                StockQuantity = dto.StockQuantity,
                MinimumStockAlert = dto.MinimumStockAlert
            };

            _context.Medications.Add(medication);
            await _context.SaveChangesAsync();

            return ToDto(medication);
        }

        public async Task<bool> RestockAsync(Guid id, int quantity)
        {
            var medication = await _context.Medications.FindAsync(id);
            if (medication == null) return false;

            medication.StockQuantity += quantity;
            await _context.SaveChangesAsync();
            return true;
        }

        private static MedicationResponseDto ToDto(Medication m)
        {
            return new MedicationResponseDto
            {
                Id = m.Id,
                Name = m.Name,
                StockQuantity = m.StockQuantity,
                MinimumStockAlert = m.MinimumStockAlert
            };
        }
    }
}