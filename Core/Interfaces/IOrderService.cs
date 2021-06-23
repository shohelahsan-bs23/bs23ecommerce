using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Entities.OrderAggregate;
using Core.Specifications;

namespace Core.Interfaces
{
    public interface IOrderService
    {
         Task<Order> CreateOrderAsync(string buyerEmail, int deliveryMethodId, string shoppingCartId, Address shippingAddress);
         Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail);
         Task<IReadOnlyList<Order>> GetOrdersForApproveRejectAsync(OrderSpecParams orderSpecParams);
         Task<int> UpdateOrdersStatusForApproveRejectAsync(int[] OrderIds, OrderStatus status, OrderSpecParams orderSpecParams);
         Task<Order> GetOrderByIdAsync(int id, string buyerEmail);
         Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodsAsync();
         Task<int> GetOrdersCountAsync();

    }
}