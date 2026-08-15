using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpecialtiesController : ControllerBase
    {
        private readonly ISpecialtyService _service;

        public SpecialtiesController(ISpecialtyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<SpecialtyResponseDto>>> GetSpecialties()
        {
            return await _service.GetAllAsync();
        }

        [HttpPost]
        public async Task<ActionResult<SpecialtyResponseDto>> CreateSpecialty(CreateSpecialtyDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }
    }
}