using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<List<PatientResponseDto>>> GetPatients()
        {
            return await _patientService.GetAllAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<PatientResponseDto>> GetPatient(Guid id)
        {
            var result = await _patientService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [HttpGet("me")]
        [Authorize(Roles = "Patient")]
        public async Task<ActionResult<PatientResponseDto>> GetMyProfile()
        {
            var patientIdClaim = User.FindFirst("patientId")?.Value;
            if (patientIdClaim == null || !Guid.TryParse(patientIdClaim, out var patientId))
                return Unauthorized();

            var result = await _patientService.GetByIdAsync(patientId);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<PatientResponseDto>> CreatePatient(CreatePatientDto dto)
        {
            var result = await _patientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetPatient), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdatePatient(Guid id, CreatePatientDto dto)
        {
            var success = await _patientService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePatient(Guid id)
        {
            var success = await _patientService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}