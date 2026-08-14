using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IProcedurePriceService
    {
        Task<List<ProcedurePriceResponseDto>> GetAllAsync();
        Task<ProcedurePriceResponseDto> CreateAsync(CreateProcedurePriceDto dto);
        Task<bool> UpdateAsync(Guid id, CreateProcedurePriceDto dto);
    }
}