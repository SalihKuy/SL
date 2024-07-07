using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using back.Data;
using back.Models;

namespace back.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class LinkController : ControllerBase
    {
        public static string createGuidString(int length, ApplicationDBContext _context, Link longLink)
        {
            string guidString = "";
            while (guidString.Length < Math.Min(99, length)) {
                guidString += Guid.NewGuid().ToString();
            }
            if(_context.linkArray.Any(l => l.shortenedLink == guidString))
                    {
                        Console.WriteLine("Shortened link already exists");
                        guidString = createGuidString(longLink.length, _context, longLink);
                    }
            return guidString.Substring(0, Math.Min(99, length));
        }
        private readonly ApplicationDBContext _context;

        public LinkController(ApplicationDBContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }


        [HttpGet]
        public IActionResult GetAll(string userID)
        {
            var links = _context.linkArray.Where(l => l.userID == userID).ToList();
            Console.WriteLine("GetAll called!");
            return Ok(links);
        }

        [HttpGet("~/{shortLink}")]
        public IActionResult RedirectToLongLink(string shortLink)
        {
            if (string.IsNullOrEmpty(shortLink))
            {
                return BadRequest("Short link cannot be null or empty.");
            }

            Console.WriteLine($"Received shortLink: {shortLink}");

            var longLink = _context.linkArray.FirstOrDefault(l => l.shortenedLink == shortLink);

            if (longLink == null)
            {
                Console.WriteLine("Shortened link not found.");
                return NotFound("The shortened link does not exist.");
            }

            Console.WriteLine($"Found long link: {longLink.link}");

            var redirectUrl = longLink.link.StartsWith("http://") || longLink.link.StartsWith("https://")
                ? longLink.link
                : "http://" + longLink.link;

            Console.WriteLine($"Redirecting to: {redirectUrl}");
            return Redirect(redirectUrl);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Link longLink)
        {
            Console.WriteLine("Create called");
            if (longLink == null || string.IsNullOrEmpty(longLink.link))
            {
                return BadRequest("Invalid input.");
            }
            try
            {
                Console.WriteLine("Start creating");
                string guidString = "";
                if(!string.IsNullOrEmpty(longLink.shortenedLink))
                {
                    Console.WriteLine("Shortened link is not null");
                    if(_context.linkArray.Any(l => l.shortenedLink == longLink.shortenedLink))
                    {
                        Console.WriteLine("Shortened link already exists");
                        return BadRequest("Shortened link already exists.");
                    }
                    guidString = longLink.shortenedLink;
                }
                else {
                    Console.WriteLine("Shortened link is null");
                    guidString = createGuidString(longLink.length, _context, longLink);
                    Console.WriteLine("Generated shortened link");
                    Console.WriteLine($"Generated shortened link: {guidString}");
                }

                longLink.shortenedLink = guidString;
                longLink.id = _context.linkArray.Max(l => l.id) + 1;
                _context.linkArray.Add(longLink);
                _context.SaveChanges();

                return CreatedAtAction(nameof(RedirectToLongLink), new { shortLink = guidString }, longLink);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "An error occurred while creating the link.");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromRoute] int id)
        {
            var link = _context.linkArray.Find(id);
            if (link == null)
            {
                Console.WriteLine("Delete failed: Link not found.");
                return NotFound();
            }

            _context.linkArray.Remove(link);
            _context.SaveChanges();
            Console.WriteLine("Delete called!");
            return NoContent();
        }
    }
}