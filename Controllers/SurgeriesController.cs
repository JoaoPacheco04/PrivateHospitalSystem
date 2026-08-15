using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff,Doctor")]
    public class SurgeriesController : ControllerBase
    {
        private readonly ISurgeryService _service;

        public SurgeriesController(ISurgeryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<SurgeryResponseDto>>> GetSurgeries()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SurgeryResponseDto>> GetSurgery(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<SurgeryResponseDto>> CreateSurgery(CreateSurgeryDto dto)
        {
            var (result, error) = await _service.CreateAsync(dto);
            if (error != null) return BadRequest(error);
            return Ok(result);
        }

        [HttpPost("{id}/team")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> AddTeamMember(Guid id, AddSurgeryTeamMemberDto dto)
        {
            var success = await _service.AddTeamMemberAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}