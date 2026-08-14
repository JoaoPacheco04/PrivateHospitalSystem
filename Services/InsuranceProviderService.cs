using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class InsuranceProviderService : IInsuranceProviderService
    {
        private readonly PrivateHospitalDbContext _context;

        public InsuranceProviderService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<InsuranceProviderResponseDto>> GetAllAsync()
        {
            return await _context.InsuranceProviders
                .Include(p => p.Coverages)
                .Select(p => ToDto(p))
                .ToListAsync();
        }

        public async Task<InsuranceProviderResponseDto?> GetByIdAsync(Guid id)
        {
            var provider = await _context.InsuranceProviders
                .Include(p => p.Coverages)
                .FirstOrDefaultAsync(p => p.Id == id);

            return provider == null ? null : ToDto(provider);
        }

        public async Task<InsuranceProviderResponseDto> CreateAsync(CreateInsuranceProviderDto dto)
        {
            var provider = new InsuranceProvider
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                ContactPhone = dto.ContactPhone,
                ContactEmail = dto.ContactEmail
            };

            _context.InsuranceProviders.Add(provider);
            await _context.SaveChangesAsync();

            return ToDto(provider);
        }

        public async Task<bool> UpdateAsync(Guid id, CreateInsuranceProviderDto dto)
        {
            var provider = await _context.InsuranceProviders.FindAsync(id);
            if (provider == null) return false;

            provider.Name = dto.Name;
            provider.ContactPhone = dto.ContactPhone;
            provider.ContactEmail = dto.ContactEmail;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var provider = await _context.InsuranceProviders.FindAsync(id);
            if (provider == null) return false;

            _context.InsuranceProviders.Remove(provider);
            await _context.SaveChangesAsync();
            return true;
        }

        private static InsuranceProviderResponseDto ToDto(InsuranceProvider p)
        {
            return new InsuranceProviderResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                ContactPhone = p.ContactPhone,
                ContactEmail = p.ContactEmail,
                IsActive = p.IsActive,
                Coverages = p.Coverages?.Select(c => new InsuranceCoverageResponseDto
                {
                    Id = c.Id,
                    InsuranceProviderId = c.InsuranceProviderId,
                    ProcedureType = c.ProcedureType,
                    CoveragePercentage = c.CoveragePercentage
                }).ToList() ?? new(),
                CreatedAt = p.CreatedAt
            };
        }
    }
}