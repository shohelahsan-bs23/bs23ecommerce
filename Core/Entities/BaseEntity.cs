using System;
namespace Core.Entities
{
    public class BaseEntity
    {
        public int Id { get; set; }
        public string EntryBy {get; set;}
        public DateTime? EntryDate {get; set;}
    }
}