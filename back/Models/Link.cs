using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace back.Models
{
    public class Link
    {
        public Link(int id, string link, string userID)
        {
            this.id = id;
            this.link = link;
            this.userID = userID;
        }
        public int id { get; set; }
        public int length { get; set; }
        public string link { get; set; }
        public string? shortenedLink { get; set; }

        public string userID { get; set; }
    }
}