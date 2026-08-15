using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
    {
        private readonly IInvoiceService _service;

        public InvoicesController(IInvoiceService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<List<InvoiceResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }


        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<List<InvoiceResponseDto>>> GetMyInvoices()
        {
            var patientIdClaim = User.FindFirst("patientId")?.Value;
            if (patientIdClaim == null || !Guid.TryParse(patientIdClaim, out var patientId))
                return Unauthorized();

            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<InvoiceResponseDto>> CreateInvoice(CreateInvoiceDto dto)
        {
            var (result, error) = await _service.CreateAsync(dto);
            if (error != null) return BadRequest(error);
            return Ok(result);
        }

        [HttpPatch("{id}/pay")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> MarkAsPaid(Guid id)
        {
            var success = await _service.MarkAsPaidAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

    }
}