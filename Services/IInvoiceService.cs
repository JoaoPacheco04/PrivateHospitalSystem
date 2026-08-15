using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IInvoiceService
    {
        // Get invoices belonging to a specific patient (used by /me endpoint)
        Task<List<InvoiceResponseDto>> GetByPatientAsync(Guid patientId);
        Task<(InvoiceResponseDto? Result, string? Error)> CreateAsync(CreateInvoiceDto dto);
        Task<bool> MarkAsPaidAsync(Guid id);
    }
}