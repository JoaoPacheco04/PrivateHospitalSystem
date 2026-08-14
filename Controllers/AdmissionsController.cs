using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdmissionsController : ControllerBase
    {
        private readonly IAdmissionService _service;

        public AdmissionsController(IAdmissionService service)
        {
            _service = service;
        }

        [HttpGet("active")]
        public async Task<ActionResult<List<AdmissionResponseDto>>> GetActiveAdmissions()
        {
            return await _service.GetActiveAsync();
        }

        [HttpPost]
        public async Task<ActionResult<AdmissionResponseDto>> CreateAdmission(CreateAdmissionDto dto)
        {
            var (result, error) = await _service.CreateAsync(dto);
            if (error != null) return BadRequest(error);
            return Ok(result);
        }

        [HttpPatch("{id}/discharge")]
        public async Task<IActionResult> DischargePatient(Guid id)
        {
            var success = await _service.DischargeAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}