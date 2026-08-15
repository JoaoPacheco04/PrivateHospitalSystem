using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class MedicationsController : ControllerBase
    {
        private readonly IMedicationService _service;

        public MedicationsController(IMedicationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<MedicationResponseDto>>> GetMedications()
        {
            return await _service.GetAllAsync();
        }

        [HttpPost]
        public async Task<ActionResult<MedicationResponseDto>> CreateMedication(CreateMedicationDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/restock")]
        public async Task<IActionResult> Restock(Guid id, [FromBody] int quantity)
        {
            var success = await _service.RestockAsync(id, quantity);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}