using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientsController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PatientResponseDto>>> GetPatients()
        {
            return await _patientService.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PatientResponseDto>> GetPatient(Guid id)
        {
            var result = await _patientService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<PatientResponseDto>> CreatePatient(CreatePatientDto dto)
        {
            var result = await _patientService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetPatient), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePatient(Guid id, CreatePatientDto dto)
        {
            var success = await _patientService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePatient(Guid id)
        {
            var success = await _patientService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}