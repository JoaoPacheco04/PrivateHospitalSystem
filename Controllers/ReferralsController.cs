using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Doctor")]
    public class ReferralsController : ControllerBase
    {
        private readonly IReferralService _service;

        public ReferralsController(IReferralService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<ReferralResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpGet("doctor/{doctorId}")]
        public async Task<ActionResult<List<ReferralResponseDto>>> GetByDoctor(Guid doctorId)
        {
            return await _service.GetByDoctorAsync(doctorId);
        }

        [HttpPost]
        public async Task<ActionResult<ReferralResponseDto>> CreateReferral(CreateReferralDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, ReferralStatusUpdateDto dto)
        {
            var success = await _service.UpdateStatusAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}