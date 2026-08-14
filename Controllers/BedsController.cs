using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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

        [HttpPost]
        public async Task<ActionResult<BedResponseDto>> CreateBed(CreateBedDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetBed), new { id = result.Id }, result);
        }
    }
}