using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicalExamsController : ControllerBase
    {
        private readonly IMedicalExamService _service;

        public MedicalExamsController(IMedicalExamService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<MedicalExamResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
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