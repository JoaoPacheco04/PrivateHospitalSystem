using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MedicalExamsController : ControllerBase
    {
        private readonly IMedicalExamService _service;

        public MedicalExamsController(IMedicalExamService service)
        {
            _service = service;
        }
        [HttpGet("patient/{patientId}")]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<List<MedicalExamResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<List<MedicalExamResponseDto>>> GetMyExams()
        {
            var patientIdClaim = User.FindFirst("patientId")?.Value;
            if (patientIdClaim == null || !Guid.TryParse(patientIdClaim, out var patientId))
                return Unauthorized();

            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<MedicalExamResponseDto>> CreateExam(CreateMedicalExamDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> CompleteExam(Guid id, [FromBody] string result)
        {
            var success = await _service.CompleteAsync(id, result);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}