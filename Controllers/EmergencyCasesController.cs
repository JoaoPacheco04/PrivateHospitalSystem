using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff,Doctor")]
    public class EmergencyCasesController : ControllerBase
    {
        private readonly IEmergencyCaseService _service;

        public EmergencyCasesController(IEmergencyCaseService service)
        {
            _service = service;
        }

        [HttpGet("queue")]
        public async Task<ActionResult<List<EmergencyCaseResponseDto>>> GetQueue()
        {
            return await _service.GetQueueAsync();
        }

        [HttpPost]
        public async Task<ActionResult<EmergencyCaseResponseDto>> CreateEmergencyCase(CreateEmergencyCaseDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/start")]
        public async Task<IActionResult> Start(Guid id, [FromBody] Guid doctorId)
        {
            var success = await _service.StartAsync(id, doctorId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/complete")]
        public async Task<IActionResult> Complete(Guid id)
        {
            var success = await _service.CompleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}