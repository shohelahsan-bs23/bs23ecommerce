using System.Security.Claims;
using System.IO.MemoryMappedFiles;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Infrastructure.Data;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Core.Interfaces;
using Core.Specifications;
using API.Dtos;
using AutoMapper;
using API.Errors;
using Microsoft.AspNetCore.Http;
using API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Core.Entities.OrderAggregate;
using API.Extensions;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController : BaseApiController
    {
        private readonly IOrderService _orderService;
        private readonly IMapper _mapper;
        public OrdersController(IOrderService orderService, IMapper mapper)
        {
            _mapper = mapper;
            _orderService = orderService;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(OrderDto orderDto)
        {
            var email = HttpContext.User.RetrieveEmailFromPrincipal();

            var address = _mapper.Map<AddressDto, Address>(orderDto.ShipToAddress);

            var order = await _orderService.CreateOrderAsync(email, orderDto.DeliveryMethodId, orderDto.ShoppingCartId, address);

            if(order == null) return BadRequest(new ApiResponse(400, "Problem creating order"));

            return Ok(order);
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<OrderToReturnDto>>> GetOrdersForUser()
        {
            var email = HttpContext.User.RetrieveEmailFromPrincipal();

            var orders = await _orderService.GetOrdersForUserAsync(email);

            return Ok(_mapper.Map<IReadOnlyList<Order>, IReadOnlyList<OrderToReturnDto>>(orders));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderToReturnDto>> GetOrderByIdForUser(int id)
        {
            var email = HttpContext.User.RetrieveEmailFromPrincipal();

            var order = await _orderService.GetOrderByIdAsync(id, email);

            if(order == null) return NotFound(new ApiResponse(404, "Order is not exists, please go for a new order."));

            return Ok(_mapper.Map<Order, OrderToReturnDto>(order));
        }

        [HttpGet("deliveryMethods")]
        public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
        {
            var deliveryMethods = await _orderService.GetDeliveryMethodsAsync();

            return Ok(deliveryMethods);
        }

        [HttpGet("for-approve-reject")]
        public async Task<ActionResult<Pagination<OrderToReturnDto>>> GetOrdersForApproveReject([FromQuery] OrderSpecParams orderParams)
        {
            var orders = await _orderService.GetOrdersForApproveRejectAsync(orderParams);

            var totalOrders = await _orderService.GetOrdersCountAsync();

            var data =_mapper.Map<IReadOnlyList<Order>, IReadOnlyList<OrderToReturnDto>>(orders);

            return Ok(new Pagination<OrderToReturnDto>(orderParams.PageIndex,
            orderParams.PageSize, totalOrders, data));
        }

        [Authorize]
        [HttpPut("approve")]
        public async Task<ActionResult<int>> ApproveSelectedOrders([FromBody] OrderParams orderUpdParams)
        {
            var ordersUpdatedCount = await _orderService.UpdateOrdersStatusForApproveRejectAsync(orderUpdParams.OrderIds, OrderStatus.Approved, orderUpdParams.OrderSpecParams);

            if (ordersUpdatedCount <= 0) return BadRequest(new ApiResponse(500, "Problem approving orders"));

            return Ok(ordersUpdatedCount);
        }

        [Authorize]
        [HttpPut("reject")]
        public async Task<ActionResult<int>> RejectSelectedOrders([FromBody] OrderParams orderUpdParams)
        {
            var ordersUpdatedCount = await _orderService.UpdateOrdersStatusForApproveRejectAsync(orderUpdParams.OrderIds, OrderStatus.Rejected, orderUpdParams.OrderSpecParams);

            if (ordersUpdatedCount <= 0) return BadRequest(new ApiResponse(500, "Problem rejecting orders"));

            return Ok(ordersUpdatedCount);
        }
    }
}