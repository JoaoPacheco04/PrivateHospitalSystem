using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IInvoiceService
    {
        Task<List<InvoiceResponseDto>> GetByPatientAsync(Guid patientId);
        Task<(InvoiceResponseDto? Result, string? Error)> CreateAsync(CreateInvoiceDto dto);
        Task<bool> MarkAsPaidAsync(Guid id);
    }
}