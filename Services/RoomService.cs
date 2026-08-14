using Microsoft.EntityFrameworkCore;
using PrivateHospitalSystem.Data;
using PrivateHospitalSystem.DTOs;
using PrivateHospitalSystem.Entities;

namespace PrivateHospitalSystem.Services
{
    public class RoomService : IRoomService
    {
        private readonly PrivateHospitalDbContext _context;

        public RoomService(PrivateHospitalDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoomResponseDto>> GetAllAsync()
        {
            return await _context.Rooms.Select(r => ToDto(r)).ToListAsync();
        }

        public async Task<RoomResponseDto?> GetByIdAsync(Guid id)
        {
            var room = await _context.Rooms.FindAsync(id);
            return room == null ? null : ToDto(room);
        }

        public async Task<RoomResponseDto> CreateAsync(CreateRoomDto dto)
        {
            var room = new Room
            {
                Id = Guid.NewGuid(),
                RoomNumber = dto.RoomNumber,
                Department = dto.Department
            };

            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();

            return ToDto(room);
        }

        public async Task<bool> UpdateAsync(Guid id, CreateRoomDto dto)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            room.RoomNumber = dto.RoomNumber;
            room.Department = dto.Department;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return false;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }

        private static RoomResponseDto ToDto(Room r)
        {
            return new RoomResponseDto
            {
                Id = r.Id,
                RoomNumber = r.RoomNumber,
                Department = r.Department,
                Status = r.Status.ToString(),
                CreatedAt = r.CreatedAt
            };
        }
    }
}