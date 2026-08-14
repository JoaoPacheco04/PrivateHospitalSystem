using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProcedurePricesController : ControllerBase
    {
        private readonly IProcedurePriceService _service;

        public ProcedurePricesController(IProcedurePriceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProcedurePriceResponseDto>>> GetAll()
        {
            return await _service.GetAllAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ProcedurePriceResponseDto>> Create(CreateProcedurePriceDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, CreateProcedurePriceDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}