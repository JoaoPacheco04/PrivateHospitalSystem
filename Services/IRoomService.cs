using PrivateHospitalSystem.DTOs;

namespace PrivateHospitalSystem.Services
{
    public interface IRoomService
    {
        Task<List<RoomResponseDto>> GetAllAsync();
        Task<RoomResponseDto?> GetByIdAsync(Guid id);
        Task<RoomResponseDto> CreateAsync(CreateRoomDto dto);
        Task<bool> UpdateAsync(Guid id, CreateRoomDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}