namespace PrivateHospitalSystem.DTOs
{
    public class DashboardResponseDto
    {
        public int TotalPatients { get; set; }
        public int TotalDoctors { get; set; }
        public int TotalBeds { get; set; }
        public int OccupiedBeds { get; set; }
        public int AvailableBeds { get; set; }
        public int AppointmentsToday { get; set; }
        public int ActiveAdmissions { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal PendingRevenue { get; set; } 

        // v2
        public int UpcomingSurgeriesCount { get; set; }
        public int EmergencyQueueCount { get; set; }
        public int LowStockMedicationsCount { get; set; }
        public double AverageFeedbackRating { get; set; }
        public int PendingReferralsCount { get; set; }
    }
}