using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _service;

        public PrescriptionsController(IPrescriptionService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<List<PrescriptionResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<List<PrescriptionResponseDto>>> GetMyPrescriptions()
        {
            var patientIdClaim = User.FindFirst("patientId")?.Value;
            if (patientIdClaim == null || !Guid.TryParse(patientIdClaim, out var patientId))
                return Unauthorized();

            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<PrescriptionResponseDto>> CreatePrescription(CreatePrescriptionDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
    }
}