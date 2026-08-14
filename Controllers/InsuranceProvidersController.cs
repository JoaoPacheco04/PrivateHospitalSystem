using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InsuranceProvidersController : ControllerBase
    {
        private readonly IInsuranceProviderService _service;

        public InsuranceProvidersController(IInsuranceProviderService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<InsuranceProviderResponseDto>>> GetInsuranceProviders()
        {
            return await _service.GetAllAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InsuranceProviderResponseDto>> GetInsuranceProvider(Guid id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<InsuranceProviderResponseDto>> CreateInsuranceProvider(CreateInsuranceProviderDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetInsuranceProvider), new { id = result.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInsuranceProvider(Guid id, CreateInsuranceProviderDto dto)
        {
            var success = await _service.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInsuranceProvider(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}