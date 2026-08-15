using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DoctorSpecialtiesController : ControllerBase
    {
        private readonly IDoctorSpecialtyService _service;

        public DoctorSpecialtiesController(IDoctorSpecialtyService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<ActionResult> CreateDoctorSpecialty(CreateDoctorSpecialtyDto dto)
        {
            var id = await _service.CreateAsync(dto.DoctorId, dto.SpecialtyId);
            return Ok(new { id });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctorSpecialty(Guid id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}