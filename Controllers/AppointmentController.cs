using Microsoft.AspNetCore.Mvc;
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
        public async Task<ActionResult<AppointmentResponseDto>> GetAppointment(Guid id)
        {
            var result = await _appointmentService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return result;
        }

        [HttpPost]
        public async Task<ActionResult<AppointmentResponseDto>> CreateAppointment(CreateAppointmentDto dto)
        {
            var (result, error) = await _appointmentService.CreateAsync(dto);
            if (error != null) return BadRequest(error);

            return CreatedAtAction(nameof(GetAppointment), new { id = result!.Id }, result);
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