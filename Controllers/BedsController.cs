using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BedsController : ControllerBase
    {
        private readonly IBedService _service;

        public BedsController(IBedService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<BedResponseDto>>> GetBeds()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("available")]
        public async Task<ActionResult<List<BedResponseDto>>> GetAvailableBeds()
        {
            return await _service.GetAvailableAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BedResponseDto>> GetBed(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpPost]
        public async Task<ActionResult<BedResponseDto>> CreateBed(CreateBedDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetBed), new { id = result.Id }, result);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateBed(Guid id, CreateBedDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> DeleteBed(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
