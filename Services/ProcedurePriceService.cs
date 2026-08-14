using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class ProcedurePriceService : IProcedurePriceService
    {
        private readonly PrivateHospitalDbContext _context;

        public ProcedurePriceService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProcedurePriceResponseDto>> GetAllAsync()
        {
            return await _context.ProcedurePrices
                .Select(p => new ProcedurePriceResponseDto
                {
                    Id = p.Id,
                    ProcedureType = p.ProcedureType,
                    Price = p.Price
                })
                .ToListAsync();
        }

        public async Task<ProcedurePriceResponseDto> CreateAsync(CreateProcedurePriceDto dto)
        {
            var price = new ProcedurePrice
            {
                Id = Guid.NewGuid(),
                ProcedureType = dto.ProcedureType,
                Price = dto.Price
            };

            _context.ProcedurePrices.Add(price);
            await _context.SaveChangesAsync();

            return new ProcedurePriceResponseDto { Id = price.Id, ProcedureType = price.ProcedureType, Price = price.Price };
        }

        public async Task<bool> UpdateAsync(Guid id, CreateProcedurePriceDto dto)
        {
            var price = await _context.ProcedurePrices.FindAsync(id);
            if (price == null) return false;

            price.ProcedureType = dto.ProcedureType;
            price.Price = dto.Price;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}