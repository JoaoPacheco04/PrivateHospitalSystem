namespace PrivateHospitalSystem.Services
{
    public interface IReminderJobService
    {
        Task SendAppointmentRemindersAsync();
        Task FlagOverdueInvoicesAsync();
    }
}
