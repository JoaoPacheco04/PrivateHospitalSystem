using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _service;

        public InvoicesController(IInvoiceService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<InvoiceResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        public async Task<ActionResult<InvoiceResponseDto>> CreateInvoice(CreateInvoiceDto dto)
        {
            var (result, error) = await _service.CreateAsync(dto);
            if (error != null) return BadRequest(error);
            return Ok(result);
        }

        [HttpPatch("{id}/pay")]
        public async Task<IActionResult> MarkAsPaid(Guid id)
        {
            var success = await _service.MarkAsPaidAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}