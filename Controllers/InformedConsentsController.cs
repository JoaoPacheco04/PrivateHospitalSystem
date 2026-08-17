using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff,Doctor,Patient")]
    public class InformedConsentsController : ControllerBase
    {
        private readonly IInformedConsentService _service;

        public InformedConsentsController(IInformedConsentService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<InformedConsentResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        public async Task<ActionResult<InformedConsentResponseDto>> Create(CreateInformedConsentDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/sign")]
        public async Task<IActionResult> Sign(Guid id)
        {
            var success = await _service.SignAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}