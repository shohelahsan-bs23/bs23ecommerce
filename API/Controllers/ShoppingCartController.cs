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

namespace API.Controllers
{
    public class ShoppingCartController : BaseApiController
    {
        private readonly IShoppingCartRepository _shoppingCartRepository;
        private readonly IMapper _mapper;
        public ShoppingCartController(IShoppingCartRepository shoppingCartRepository, IMapper mapper)
        {
            _mapper = mapper;
            _shoppingCartRepository = shoppingCartRepository;
        }

        [HttpGet]
        public async Task<ActionResult<CustomerShoppingCart>> GetShoppingCartById(string id)
        {
            var shoppingCart = await _shoppingCartRepository.GetShoppingCartAsync(id);
            return Ok(shoppingCart ?? new CustomerShoppingCart(id));
        }

        [HttpPost]
        public async Task<ActionResult<CustomerShoppingCart>> UpdateShoppingCart(CustomerShoppingCartDto shoppingCartDto)
        {
            var shoppingCart = _mapper.Map<CustomerShoppingCartDto, CustomerShoppingCart>(shoppingCartDto);
            var updatedShoppingCart = await _shoppingCartRepository.UpdateShoppingCartAsync(shoppingCart);
            return Ok(updatedShoppingCart);
        }

        [HttpDelete]
        public async Task DeleteShoppingCart(string id)
        {
            await _shoppingCartRepository.DeleteShoppingCartAsync(id);
        }
    }
}