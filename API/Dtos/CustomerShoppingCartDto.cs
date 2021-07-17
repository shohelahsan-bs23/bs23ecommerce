using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace API.Dtos
{
    public class CustomerShoppingCartDto
    {
        [Required]
        public string Id { get; set; }
        public List<ShoppingCartItemDto> Items {get; set;} = new List<ShoppingCartItemDto>() ;
        public int? DeliveryMethodId { get; set; }
        public string ClientSecret { get; set; }
        public string PaymentIntentId { get; set; }
        public decimal ShippingPrice { get; set; }
    }
}