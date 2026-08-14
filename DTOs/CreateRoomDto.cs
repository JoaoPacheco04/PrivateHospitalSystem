namespace PrivateHospitalSystem.DTOs
{
    public class CreateRoomDto
    {
        public string RoomNumber { get; set; } = string.Empty;
        public string? Department { get; set; }
    }
}