using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Dtos
{
    public class CustomerShoppingCartDto
    {
        [Required]
        public string Id { get; set; }
        public List<ShoppingCartItemDto> Items {get; set;} = new List<ShoppingCartItemDto>() ;
    }
}