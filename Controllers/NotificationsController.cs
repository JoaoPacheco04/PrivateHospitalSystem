using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Services;

namespace PrivateHospitalSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationsController(INotificationService service)
        {
            _service = service;
        }

        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetByPatient(Guid patientId)
        {
            return await _service.GetByPatientAsync(patientId);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Staff,Doctor")]
        public async Task<ActionResult<NotificationResponseDto>> Create(CreateNotificationDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var success = await _service.MarkAsReadAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}