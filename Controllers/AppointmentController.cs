using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AppointmentResponseDto>>> GetAppointments()
        {
            return await _appointmentService.GetAllAsync();
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<AppointmentResponseDto>> GetAppointment(Guid id)
        {
            var result = await _appointmentService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }
        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment(CreateAppointmentDto dto)
        {
            var (result, error) = await _appointmentService.CreateAsync(dto);
            if (error != null) return BadRequest(error);

            return CreatedAtAction(nameof(GetAppointment), new { id = result!.Id }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateAppointment(Guid id, CreateAppointmentDto dto)
        {
            var success = await _appointmentService.UpdateAsync(id, dto);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> DeleteAppointment(Guid id)
        {
            var success = await _appointmentService.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelAppointment(Guid id)
        {
            var success = await _appointmentService.CancelAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}