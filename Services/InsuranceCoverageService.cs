using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class InsuranceCoverageService : IInsuranceCoverageService
    {
        private readonly PrivateHospitalDbContext _context;

        public InsuranceCoverageService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<InsuranceCoverageResponseDto>> GetAllAsync()
        {
            return await _context.InsuranceCoverages
                .Select(c => ToDto(c))
                .ToListAsync();
        }

        public async Task<InsuranceCoverageResponseDto?> GetByIdAsync(Guid id)
        {
            var coverage = await _context.InsuranceCoverages.FindAsync(id);
            return coverage == null ? null : ToDto(coverage);
        }

        public async Task<InsuranceCoverageResponseDto> CreateAsync(CreateInsuranceCoverageDto dto)
        {
            var coverage = new InsuranceCoverage
            {
                Id = Guid.NewGuid(),
                InsuranceProviderId = dto.InsuranceProviderId,
                ProcedureType = dto.ProcedureType,
                CoveragePercentage = dto.CoveragePercentage
            };

            _context.InsuranceCoverages.Add(coverage);
            await _context.SaveChangesAsync();

            return ToDto(coverage);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var coverage = await _context.InsuranceCoverages.FindAsync(id);
            if (coverage == null) return false;

            _context.InsuranceCoverages.Remove(coverage);
            await _context.SaveChangesAsync();
            return true;
        }

        private static InsuranceCoverageResponseDto ToDto(InsuranceCoverage c)
        {
            return new InsuranceCoverageResponseDto
            {
                Id = c.Id,
                InsuranceProviderId = c.InsuranceProviderId,
                ProcedureType = c.ProcedureType,
                CoveragePercentage = c.CoveragePercentage
            };
        }
    }
}