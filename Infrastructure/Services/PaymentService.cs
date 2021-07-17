using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Entities;
using Core.Entities.OrderAggregate;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.Extensions.Configuration;
using Stripe;
using Order = Core.Entities.OrderAggregate.Order;
using Product = Core.Entities.Product;

namespace Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IShoppingCartRepository _shoppingCartRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _config;
        public PaymentService(IShoppingCartRepository shoppingCartRepository, IUnitOfWork unitOfWork, IConfiguration config)
        {
            _config = config;
            _unitOfWork = unitOfWork;
            _shoppingCartRepository = shoppingCartRepository;
        }

        public async Task<CustomerShoppingCart> CreateOrUpdatePaymentIntent(string shoppingCartId)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var shoppingCart = await _shoppingCartRepository.GetShoppingCartAsync(shoppingCartId);

            if(shoppingCart == null)
            {
                return null;
            }

            var shippingPrice = 0m;

            if(shoppingCart.DeliveryMethodId.HasValue)
            {
                var deliveryMethod = await _unitOfWork.Repository<DeliveryMethod>().GetByIdAsync(shoppingCart.DeliveryMethodId.Value);
                shippingPrice = deliveryMethod.Price;

            }

            foreach (var item in shoppingCart.Items)
            {
                var productItem = await _unitOfWork.Repository<Product>().GetByIdAsync(item.Id);
                if(item.Price != productItem.Price)
                {
                    item.Price = productItem.Price;
                }
            }

            var service = new PaymentIntentService();

            PaymentIntent intent;

            if(string.IsNullOrEmpty(shoppingCart.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long) shoppingCart.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100,
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> {"card"}
                };
                intent = await service.CreateAsync(options);
                shoppingCart.PaymentIntentId = intent.Id;
                shoppingCart.ClientSecret = intent.ClientSecret;
            }
            else
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = (long) shoppingCart.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)shippingPrice * 100
                };
                await service.UpdateAsync(shoppingCart.PaymentIntentId, options);
            }

            await _shoppingCartRepository.UpdateShoppingCartAsync(shoppingCart);

            return shoppingCart;
        }

        public async Task<Order> UpdateOrderPaymentFailed(string paymentIntentId)
        {
            var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
            var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            if(order == null) return null;

            order.Status = OrderStatus.PaymentFailed;
            _unitOfWork.Repository<Order>().Update(order);

            await _unitOfWork.CompleteAsync();

            return null;
        }

        public async Task<Order> UpdateOrderPaymentSucceeded(string paymentIntentId)
        {
            var spec = new OrderByPaymentIntentIdSpecification(paymentIntentId);
            var order = await _unitOfWork.Repository<Order>().GetEntityWithSpec(spec);

            if(order == null) return null;

            order.Status = OrderStatus.PaymentReceived;
            _unitOfWork.Repository<Order>().Update(order);

            await _unitOfWork.CompleteAsync();

            return order;
        }
    }
}