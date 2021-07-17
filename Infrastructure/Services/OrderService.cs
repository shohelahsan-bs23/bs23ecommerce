using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;

namespace Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly IShoppingCartRepository _shoppingCartRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPaymentService _paymentService;
        public OrderService(IUnitOfWork unitOfWork, IShoppingCartRepository shoppingCartRepo, IPaymentService paymentService)
        {
            _paymentService = paymentService;
            _unitOfWork = unitOfWork;
            _shoppingCartRepo = shoppingCartRepo;
        }

        public async Task<Order> CreateOrderAsync(string buyerEmail, int deliveryMethodId, string shoppingCartId, Address shippingAddress)
        {
            // get a shopping cart from the repo
            var cart = await _shoppingCartRepo.GetShoppingCartAsync(shoppingCartId);

            // get the items from the product repo
            var items = new List<OrderItem>();
            foreach (var item in cart.Items)
            {
                var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
                var itemOrderd = new ProductItemOrdered(productItem.Id, productItem.Name, productItem.PictureUrl);
                var orderItem = new OrderItem(itemOrderd, productItem.Price, item.Quantity);
                items.Add(orderItem);
            }

            // get delivery method from the repo
            var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(deliveryMethodId);

            // calc subtotal
            var subTotal = items.Sum(item => item.Price * item.Quantity);

            //check to see if order exists
            var spec = new OrderByPaymentIntentIdSpecification(cart.PaymentIntentId);
            var existingOrder = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            if (existingOrder != null)
            {
                _unitOfWork.Repository<Order>().Delete(existingOrder);
                await _paymentService.CreateOrUpdatePaymentIntent(cart.PaymentIntentId);
            }

            // create order
            var order = new Order(items, buyerEmail, shippingAddress, deliveryMethod, subTotal, cart.PaymentIntentId);
            _unitOfWork.Repository<Order>().Add(order);

            // save to db
            var result = await _unitOfWork.CompleteAsync();

            if (result <= 0) return null;
            
            // return order
            return order;
        }

        public async Task<IReadOnlyList<DeliveryMethod>> GetDeliveryMethodsAsync()
        {
            return await _unitOfWork.Repository<DeliveryMethod>().ListAllAsync();
        }

        public async Task<Order> GetOrderByIdAsync(int id, string buyerEmail)
        {
            var spec = new OrdersWithItemsAndOrderingSpecification(id, buyerEmail);
            return await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);
        }

        public async Task<IReadOnlyList<Order>> GetOrdersForUserAsync(string buyerEmail)
        {
            var spec = new OrdersWithItemsAndOrderingSpecification(buyerEmail);
            return await _unitOfWork.Repository<Order>().ListAsync(spec);
        }

        public async Task<IReadOnlyList<Order>> GetOrdersForApproveRejectAsync(OrderSpecParams orderSpecParams)
        {
            var spec = new OrdersWithItemsAndOrderingSpecification(orderSpecParams);
            return await _unitOfWork.Repository<Order>().ListAsync(spec);
        }

        public async Task<int> GetOrdersCountAsync()
        {
            return await _unitOfWork.Repository<Order>().CountAsync();
        }

        public async Task<int> UpdateOrdersStatusForApproveRejectAsync(int[] orderIds, OrderStatus status, OrderSpecParams orderSpecParams)
        {
            var spec = new OrdersWithItemsAndOrderingSpecification(orderIds.ToList());

            var orderList = await _unitOfWork.Repository<Order>().ListAsync(spec);

            List<Order> listOrder = new List<Order>();
            foreach (var order in orderList)
            {
                order.Status = status;
                listOrder.Add(order);
            }
            _unitOfWork.Repository<Order>().UpdateRange(listOrder);

            // save to db
            var result = await _unitOfWork.CompleteAsync();
            return result;
            //var specific = new OrdersWithItemsAndOrderingSpecification(orderSpecParams);
            //return await _unitOfWork.Repository<Order>().ListAsync(specific);
        }
    }
}